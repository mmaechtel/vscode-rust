import { spawn } from 'child_process';

import {
    CloseAction,
    ErrorAction,
    ErrorHandler as IErrorHandler,
    LanguageClient,
    RevealOutputChannelOn
} from 'vscode-languageclient';

class ErrorHandler implements IErrorHandler {
    private onClosed: () => void;

    public constructor(onClosed: () => void) {
        this.onClosed = onClosed;
    }

    public error(): ErrorAction {
        return ErrorAction.Continue;
    }

    public closed(): CloseAction {
        this.onClosed();

        return CloseAction.DoNotRestart;
    }
}

export class Creator {
    private executable: string;
    private args: string[];
    private env: any;
    private revealOutputChannelOn: RevealOutputChannelOn;
    private onClosed: () => void;

    public constructor(
        executable: string,
        args: string[],
        env: any,
        revealOutputChannelOn: RevealOutputChannelOn,
        onClosed: () => void
    ) {
        this.executable = executable;
        this.args = args;
        this.env = env;
        this.revealOutputChannelOn = revealOutputChannelOn;
        this.onClosed = onClosed;
    }

    public create(): LanguageClient {
        const clientOptions = {
            documentSelector: ['rust'],
            revealOutputChannelOn: this.revealOutputChannelOn,
            errorHandler: new ErrorHandler(this.onClosed)
        };
        const opts = {
            env: Object.assign({}, process.env, this.env)
        };
        const serverOptions = () => {
            const process = spawn(this.executable, this.args, opts);
            return Promise.resolve(process);
        };
        return new LanguageClient('Rust Language Server', serverOptions, clientOptions);
    }
}
