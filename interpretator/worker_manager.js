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
        this.worker = new Worker("./interpretator/interpretator.js", { type: 'module' });

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
                this.output(`${message}`);
                this.cleanup();
                break;
            }
        };

        this.worker.onerror = (e) => {
            // console.error('Worker Error', {
            //     message: e.message,
            //     filename: e.filename,
            //     lineno: e.lineno,
            //     colno: e.colno,
            //     error: e.error
            // });
            
            this.output(`Worker error: ${e.error}`);
            
            this.stop();
            
            return true;
            // console.log(e);
            // this.cleanup();
            // this.output(`worker error: ${e.}`);
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