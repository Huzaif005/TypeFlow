export class Timer {
    constructor(duration, tickCallback, finishCallback) {
        this.duration = duration;
        this.timeLeft = duration;
        this.timerInterval = null;
        this.tickCallback = tickCallback;
        this.finishCallback = finishCallback;
    }

    start() {
        if (this.timerInterval) return;
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (this.tickCallback) this.tickCallback(this.timeLeft);

            if (this.timeLeft <= 0) {
                this.stop();
                if (this.finishCallback) this.finishCallback();
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    reset(newDuration) {
        this.stop();
        if (newDuration) this.duration = newDuration;
        this.timeLeft = this.duration;
    }
    
    getTimeLeft() {
        return this.timeLeft;
    }
    
    getElapsedTime() {
        return this.duration - this.timeLeft;
    }
}
