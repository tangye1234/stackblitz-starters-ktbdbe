import { useQuery } from '@tanstack/react-query';
import { useEffect, useId } from 'react';

export function Infinite({ page = 0 }: { page?: number }) {
  const enabled = page === 0;

  const {
    data: { list: data = undefined, hasMore = false } = {},
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['infinite', page],
    queryFn: () => query(page, 1000),
    refetchOnWindowFocus: false,
    enabled,
    staleTime: 60 * 5 * 1000,
  });

  const id = useId();
  useEffect(() => {
    if (data) return;

    const last = document.getElementById(id);
    if (!last) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        refetch();
      }
    });
    observer.observe(last);

    return () => {
      observer.disconnect();
    };
  }, [data]);

  return (
    <>
      {!data ? (
        isFetching ? (
          <Skeleton />
        ) : (
          <div id={id} className="h-px" />
        )
      ) : (
        data.map(({ index, ratio }) => (
          <div
            className={`grid place-content-center border rounded bg-gray-200 ${ratio}`}
            key={index}
          >
            {index}
          </div>
        ))
      )}

      {hasMore && <Infinite page={page + 1} />}
    </>
  );
}

function Skeleton() {
  return (
    <>
      <div className="bg-gray-100 animate-pulse aspect-square" />
      <div className="bg-gray-100 animate-pulse aspect-square" />
      <div className="bg-gray-100 animate-pulse aspect-square" />
      <div className="bg-gray-100 animate-pulse aspect-square" />
    </>
  );
}

const pageSize = 20;

async function query(page: number, wait: number) {
  await new Promise((resolve) => setTimeout(resolve, wait));
  return {
    list: new Array(pageSize).fill(0).map((_, index) => ({
      index: pageSize * page + index,
      ratio: Math.random() < 0.4 ? 'aspect-square' : 'aspect-video',
    })),
    hasMore: page < 50,
  };
}
