import { ANSI } from './ANSI';

type Source = string | undefined;

function fmt(source: Source, level: string, color: ANSI, msg: string) {
  const src = source ? `${source}` : 'local';
  return `${color}[${level}(${src})]${ANSI.Reset} ${msg}`;
}

export function info(source: Source, ...parts: any[]) {
  const msg = parts.map(String).join(' ');
  console.log(fmt(source, 'Info', ANSI.Cyan, msg));
}

export function warn(source: Source, ...parts: any[]) {
  const msg = parts.map(String).join(' ');
  console.warn(fmt(source, 'Warn', ANSI.Yellow, msg));
}

export function error(source: Source, ...parts: any[]) {
  const msg = parts.map(String).join(' ');
  console.error(fmt(source, 'Error', ANSI.Red, msg));
}

export function debug(source: Source, ...parts: any[]) {
  if (process.env.DEBUG?.toLowerCase() === 'true') {
    const msg = parts.map(String).join(' ');
    console.debug(fmt(source, 'Debug', ANSI.Gray, msg));
  }
}

export default { info, warn, error, debug };
