class WorkerManager {
    constructor(output_callback) {
        this.output = output_callback;
        this.worker = null;
        this.is_running = false;
    }

    start(ast) {
        if (this.is_running) {
            this.stop();
        }

        this.is_running = true;
        this.worker = new Worker("./interpretator.js", { type: 'module' });

        this.worker.onmessage = (e) => {
            const {type, message} = e.data;

            switch (type) {
            case 'output':
                this.output(message);
                break;
            case 'done':
                this.output('Done');
                this.cleanup();
                break;
            case 'error':
                this.output(`${message}`, 'error');
                this.cleanup();
                break;
            }
        };

        this.worker.onerror = (e) => {
            this.output("Worker error");
        };

        this.worker.postMessage({ ast });
    }

    stop() {
        this.cleanup();
        this.output("stopped");
    }

    cleanup() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }

        this.is_running = false;
    }
}

export default WorkerManager;