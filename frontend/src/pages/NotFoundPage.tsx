import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-6xl font-bold text-gray-200">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-700">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-sm text-gray-400">주소가 잘못됐거나 아직 준비 중인 페이지예요.</p>
      <Link to="/" className="mt-6 px-5 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600">
        홈으로 돌아가기
      </Link>
    </div>
  )
}
