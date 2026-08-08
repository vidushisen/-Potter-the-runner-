/* Controls.js - Standard Intuitive Input Handler (Left = Left, Right = Right) */

export class Controls {
  constructor(onAction) {
    this.onAction = onAction; // callback for: 'left', 'right', 'jump', 'slide', 'spell', 'pause'
    
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.minSwipeDistance = 25;
    
    this.bindKeyboard();
    this.bindTouch();
    this.bindScreenTap();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.onAction('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.onAction('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          this.onAction('jump');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
        case 'Shift':
          this.onAction('slide');
          break;
        case 'e':
        case 'E':
        case 'f':
        case 'F':
          this.onAction('spell');
          break;
        case 'Escape':
        case 'p':
        case 'P':
          this.onAction('pause');
          break;
      }
    });
  }

  bindTouch() {
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - this.touchStartX;
        const deltaY = e.changedTouches[0].clientY - this.touchStartY;
        
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (Math.max(absX, absY) > this.minSwipeDistance) {
          if (absX > absY) {
            // Horizontal swipe
            if (deltaX > 0) {
              this.onAction('right');
            } else {
              this.onAction('left');
            }
          } else {
            // Vertical swipe
            if (deltaY < 0) {
              this.onAction('jump');
            } else {
              this.onAction('slide');
            }
          }
        }
      }
    }, { passive: true });
  }

  bindScreenTap() {
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
      canvas.addEventListener('click', (e) => {
        const clickX = e.clientX;
        const screenWidth = window.innerWidth;

        if (clickX < screenWidth * 0.45) {
          this.onAction('left');
        } else if (clickX > screenWidth * 0.55) {
          this.onAction('right');
        } else {
          this.onAction('jump');
        }
      });
    }
  }
}
