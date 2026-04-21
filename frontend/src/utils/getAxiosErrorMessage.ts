import { isAxiosError } from 'axios';

type Context = 'image' | 'nickname' | 'delete';

const DEFAULT_MESSAGE = '요청 처리 중 문제가 생겼어요. 다시 시도해주세요.';
const UNAUTHORIZED_MESSAGE = '로그인이 만료됐어요. 다시 로그인해주세요.';

const message: Record<Context, Record<number, string>> = {
  image: {
    413: '5MB 이하의 파일만 업로드할 수 있습니다.',
    415: '지원하지 않는 이미지 형식입니다.',
    401: UNAUTHORIZED_MESSAGE,
  },
  nickname: {
    409: '이미 사용 중인 닉네임입니다.',
    400: '닉네임 형식이 올바르지 않습니다.',
    401: UNAUTHORIZED_MESSAGE,
  },
  delete: {
    401: UNAUTHORIZED_MESSAGE,
  },
};

export function getAxiosErrorMessage(err: unknown, context: Context): string {
  if (!isAxiosError(err)) return DEFAULT_MESSAGE;

  const status = err.response?.status;

  if (status === undefined) return DEFAULT_MESSAGE;

  return message[context][status] ?? DEFAULT_MESSAGE;
}
