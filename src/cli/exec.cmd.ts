import { exec } from "child_process";

export const execCommand = (cmd: any, callback: any = null, throwError = true) => {
  console.log(`Executing "${cmd}"`);

  return new Promise((resolve, reject) => {
    exec(cmd, async (error, stdout, stderr) => {
      if (callback) await callback(error, stdout, stderr);
      if (error && throwError) {
        reject(error);
      } else {
        resolve(stdout || stderr || error);
      }
    });
  });
};
