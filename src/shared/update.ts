/** 检查更新 IPC 返回 */
export type UpdateCheckResponse =
  | { status: 'dev'; currentVersion: string }
  | { status: 'latest'; currentVersion: string; latestVersion: string }
  | { status: 'available'; currentVersion: string; latestVersion: string }
  | { status: 'error'; currentVersion: string; message: string }

export interface UpdateProgressPayload {
  percent: number
}

export const GITHUB_RELEASES_URL = 'https://github.com/123yangyan/emotion/releases'
