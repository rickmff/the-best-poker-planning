interface CanvasSize {
    width: number;
    height: number;
  }
  
  class Particle {
    private x: number = 0;
    private y: number = 0;
    private speed: number = 0.1;
    private opacity: number = 1;
    private fadeDelay: number;
    private fadeStart: number;
    private fadingOut: boolean;
  
    constructor(
      private canvas: HTMLCanvasElement,
      private ctx: CanvasRenderingContext2D
    ) {
      this.reset();
      this.y = Math.random() * canvas.height;
      this.fadeDelay = Math.random() * 600 + 100;
      this.fadeStart = Date.now() + this.fadeDelay;
      this.fadingOut = false;
    }
  
    reset(): void {
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      this.speed = Math.random() / 5 + 0.1;
      this.opacity = 1;
      this.fadeDelay = Math.random() * 600 + 100;
      this.fadeStart = Date.now() + this.fadeDelay;
      this.fadingOut = false;
    }
  
    update(): void {
      this.y -= this.speed;
      if (this.y < 0) {
        this.reset();
      }
      if (!this.fadingOut && Date.now() > this.fadeStart) {
        this.fadingOut = true;
      }
      if (this.fadingOut) {
        this.opacity -= 0.008;
        if (this.opacity <= 0) {
          this.reset();
        }
      }
    }
  
    draw(): void {
      this.ctx.fillStyle = `rgba(${255 - Math.random() * 255}, 255, 255, ${this.opacity})`;
      this.ctx.fillRect(this.x, this.y, 0.4, Math.random() * 2 + 1);
    }
  }
  
  export function useParticleAnimation() {
    let particles: Particle[] = [];
    let animationFrameId: number | null = null;
  
    const initParticles = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, particleCount: number): void => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas, ctx));
      }
    };
  
    const animate = (ctx: CanvasRenderingContext2D, canvasSize: CanvasSize): void => {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      animationFrameId = requestAnimationFrame(() => animate(ctx, canvasSize));
    };
  
    const stopAnimation = (): void => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  
    return {
      initParticles,
      animate,
      stopAnimation,
    };
  }