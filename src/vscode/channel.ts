import {
  OutputChannel,
  window,
} from 'vscode';

export let vscChannel: OutputChannel;

export function initChannel() {
  vscChannel = window.createOutputChannel('JS/TS Import/Export Sorter');
}

export function uninitChannel() {
  vscChannel.dispose();
}
