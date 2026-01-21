'use client';

import { Category } from '@/types/Category';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { DropdownMenu, DropdownMenuTrigger } from './ui/dropdown-menu';
import Image from 'next/image';
import { useState } from 'react';
import { fetchWithToken } from '@/utils/fetchWithToken';
import { toast } from 'sonner';

interface CategoryDeleterProps {
  categories: Category[];
  onDelete?: () => void;
}

export default function CategoryDeleter({
  categories,
  onDelete,
}: CategoryDeleterProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter(
    (cat) => cat.category_name !== '전체'
  );

  const handleDelete = async () => {
    if (!selectedCategory) {
      toast.error('삭제할 카테고리를 선택해주세요');
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/${selectedCategory.category_id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete category');

      toast.success('카테고리가 삭제되었습니다');
      setSelectedCategory(null);
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('카테고리 삭제에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const outlineTrigger =
    'outline-none w-[400px] rounded-2xl flex items-center justify-between bg-card text-foreground border border-border transition focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';

  const dangerBtn =
    'flex items-center justify-center gap-2 rounded-2xl p-4 w-[200px] text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed bg-destructive text-white hover:opacity-95';

  return (
    <div className="flex w-full gap-8">
      <div className="flex flex-col gap-2">
        <DropdownMenu>
          <span className="inter-semibold text-foreground">삭제할 점포</span>

          <DropdownMenuTrigger
            className={outlineTrigger}
            disabled={loading || filteredCategories.length === 0}
          >
            {filteredCategories.length === 0 ? (
              <span className="inter-regular p-4 text-muted-foreground">
                생성된 카테고리가 없습니다
              </span>
            ) : (
              <>
                <span className="inter-regular w-full p-4 text-left">
                  {selectedCategory
                    ? `${selectedCategory.category_name} (${selectedCategory.category_name_en})`
                    : '점포 선택'}
                </span>
                <Image
                  src="/DownArrow.svg"
                  alt="arrow-down"
                  width={16}
                  height={16}
                  className="mx-4 opacity-70"
                />
              </>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[400px] left-0 bg-card text-foreground border border-border">
            <DropdownMenuSeparator />
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                생성된 카테고리가 없습니다
              </div>
            ) : (
              filteredCategories.map((category) => (
                <DropdownMenuItem
                  key={category.category_id}
                  className="w-[400px] cursor-pointer focus:bg-accent focus:text-foreground"
                  onSelect={() => setSelectedCategory(category)}
                >
                  {`${category.category_name} (${category.category_name_en})`}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-2">
        <span className="inter-semibold text-foreground">점포 삭제</span>

        <button
          onClick={handleDelete}
          disabled={!selectedCategory || loading}
          className={dangerBtn}
        >
          <Image src="/Submit.svg" alt="delete" width={16} height={16} />
          <span className="inter-regular">
            {loading ? '처리중...' : '삭제하기'}
          </span>
        </button>
      </div>
    </div>
  );
}
