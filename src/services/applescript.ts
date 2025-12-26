/**
 * Service for executing AppleScript commands to interact with Apple Mail
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Execute an AppleScript command
 */
export async function executeAppleScript(script: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(`osascript -e '${escapeAppleScript(script)}'`);
    
    if (stderr) {
      console.error('AppleScript stderr:', stderr);
    }
    
    return stdout.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AppleScript execution failed: ${error.message}`);
    }
    throw new Error('AppleScript execution failed with unknown error');
  }
}

/**
 * Escape single quotes in AppleScript string
 */
function escapeAppleScript(script: string): string {
  return script.replace(/'/g, "'\\''");
}

/**
 * Execute a multi-line AppleScript from a file-like string
 */
export async function executeAppleScriptFile(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const osascript = spawn('osascript', ['-']);

    let stdout = '';
    let stderr = '';

    osascript.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    osascript.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    osascript.on('error', (error) => {
      reject(new Error(`AppleScript execution failed: ${error.message}`));
    });

    osascript.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`AppleScript execution failed with code ${code}: ${stderr}`));
      } else {
        if (stderr) {
          console.error('AppleScript stderr:', stderr);
        }
        resolve(stdout.trim());
      }
    });

    // Write the script to stdin
    osascript.stdin.write(script);
    osascript.stdin.end();
  });
}

/**
 * Check if Apple Mail is running
 */
export async function isMailRunning(): Promise<boolean> {
  try {
    const result = await executeAppleScript(
      'tell application "System Events" to (name of processes) contains "Mail"'
    );
    return result.toLowerCase() === 'true';
  } catch {
    return false;
  }
}

/**
 * Ensure Apple Mail is running
 */
export async function ensureMailRunning(): Promise<void> {
  const running = await isMailRunning();
  if (!running) {
    await executeAppleScript('tell application "Mail" to activate');
    // Give Mail a moment to launch
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
