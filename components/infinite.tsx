import { useQuery } from '@tanstack/react-query';

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

export function Infinite({ page = 0 }: { page?: number }) {
  const { data: { list: data = undefined, hasMore = false } = {} } = useQuery({
    queryKey: ['infinite', page],
    queryFn: () => query(page, 1000),
    refetchOnWindowFocus: false,
  });

  return (
    <>
      {!data ? (
        <Skelenton />
      ) : (
        data.map(({ index, ratio }) => (
          <div
            className={`grid place-content-center border rounded ${ratio}`}
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

function Skelenton() {
  return (
    <>
      <div className="bg-gray-200 animate-pulse aspect-square" />
      <div className="bg-gray-200 animate-pulse aspect-square" />
      <div className="bg-gray-200 animate-pulse aspect-square" />
      <div className="bg-gray-200 animate-pulse aspect-square" />
    </>
  );
}
