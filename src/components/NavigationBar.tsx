'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchWithToken } from '@/utils/fetchWithToken';
import { toast } from 'sonner';

interface StoreInfo {
  email: string;
  adminName: string;
  storeName: string;
}

export default function NavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const fetchStoreInfo = async () => {
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/store-info`
      );
      if (!response.ok) throw new Error('Failed to fetch store info');
      const data = await response.json();
      setStoreInfo(data);
    } catch (error) {
      console.error('Failed to fetch store info:', error);
      toast.error('가게 정보를 불러오는데 실패했습니다');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    document.cookie =
      'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie =
      'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      toast.error('비밀번호를 입력해주세요');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/delete-admin`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      document.cookie =
        'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie =
        'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      toast.success('계정이 삭제되었습니다');
      router.push('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('계정 삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setPassword('');
    }
  };

  const navItems = [
    { href: '/dashboard', label: '가게 관리', icon: 'Dashboard' },
    { href: '/categories', label: '점포 관리', icon: 'Cate' },
    { href: '/menus', label: '메뉴 관리', icon: 'Menu' },
    { href: '/orders', label: '키오스크 관리', icon: 'Order' },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={[
          'w-[20%] h-full flex flex-col',
          // ✅ 라운드 제거
          'rounded-none',
          'bg-sidebar text-sidebar-foreground',
        ].join(' ')}
      >
        {/* Profile */}
        <div className="p-6 flex flex-col items-center gap-4">
          {storeInfo && (
            <>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center relative overflow-hidden border"
                style={{
                  background: 'var(--ml-auth-logo-bg)',
                  borderColor: 'var(--border)',
                  boxShadow: '0 8px 20px rgba(120,98,70,0.25)',
                }}
              >
                <span
                  className="text-xl font-semibold"
                  style={{
                    background: 'var(--ml-auth-logo-text-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 1px 1px rgba(0,0,0,0.15)',
                  }}
                >
                  {storeInfo.adminName.slice(1, 3)}
                </span>
              </div>

              <div className="text-center">
                <p className="font-semibold text-sidebar-foreground">
                  {storeInfo.adminName}
                </p>
                <p className="text-sm text-muted-foreground">{storeInfo.email}</p>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <ul className="flex flex-col gap-2 w-[84%] mx-auto mt-4">
          {navItems.map(({ href, label, icon }) => {
            const isSelected = pathname === href;
            const imageSrc = `/${icon}${isSelected ? 'S' : ''}.svg`;

            return (
              <li
                key={href}
                className={[
                  'w-full p-4 rounded-2xl transition',
                  isSelected
                    ? 'bg-card text-foreground shadow-sm'
                    : 'hover:bg-accent text-sidebar-foreground',
                ].join(' ')}
              >
                <Link href={href} className="flex items-center gap-2">
                  <Image src={imageSrc} alt={label} width={18} height={18} />
                  <p>{label}</p>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Bottom actions */}
        <div className="mt-auto mb-8 w-[84%] mx-auto flex items-center gap-2 text-sm">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className={[
              'flex flex-1 items-center justify-center gap-2 px-4 py-3 rounded-2xl transition',
              // ✅ 탈퇴 버튼: 배경은 밝게 두되 글자/테두리 대비 올림
              'bg-card text-foreground border border-border hover:bg-accent',
            ].join(' ')}
          >
            <Image src="/Delete-admin.svg" alt="탈퇴" width={18} height={18} />
            <span className="text-foreground">탈퇴</span>
          </button>

          <button
            onClick={handleLogout}
            className={[
              'flex flex-1 items-center justify-center gap-2 px-4 py-3 rounded-2xl transition',
              'bg-primary hover:opacity-95',
            ].join(' ')}
          >
            <Image src="/Logout.svg" alt="로그아웃" width={18} height={18} />
            {/* ✅ 로그아웃 글자 흰색 */}
            <span className="text-white">로그아웃</span>
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card text-foreground rounded-2xl p-6 w-[400px] border border-border shadow-lg">
            <h2 className="text-xl font-semibold mb-3">계정 삭제</h2>
            <p className="text-sm text-muted-foreground mb-4">
              계정을 삭제하시려면 비밀번호를 입력해주세요.
            </p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className={[
                'w-full px-3 py-2 rounded-xl text-sm',
                'bg-card text-foreground border border-border outline-none transition',
                'focus:ring-2 focus:ring-ring focus:border-transparent',
              ].join(' ')}
            />

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setPassword('');
                }}
                className="px-4 py-2 rounded-xl text-sm bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition"
              >
                취소
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={[
                  'px-4 py-2 rounded-xl text-sm text-white transition',
                  'bg-destructive hover:opacity-95 disabled:opacity-50',
                ].join(' ')}
              >
                {isDeleting ? '처리중...' : '탈퇴'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
