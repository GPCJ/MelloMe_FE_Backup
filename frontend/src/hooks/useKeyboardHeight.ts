import { useEffect, useState } from 'react';

/**
 * visualViewport API를 이용해 모바일 가상 키보드 높이를 추적한다.
 * 키보드가 올라와도 페이지 콘텐츠는 밀리지 않고,
 * 반환된 높이값으로 fixed 요소만 키보드 위에 위치시킬 수 있다.
 */
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function handleResize() {
      const vv = window.visualViewport;
      if (!vv) return;
      // innerHeight는 키보드와 무관하게 고정, visualViewport.height는 키보드만큼 줄어듦
      const height = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardHeight(Math.max(0, height));
    }

    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);

    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, []);

  return keyboardHeight;
}
