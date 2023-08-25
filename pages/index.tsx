import { Infinite } from '@components/infinite';
import { Masonry } from '@components/masonry';

const columns = {
  640: 3,
  768: 4,
  default: 5,
};

const spacing = {
  640: 6,
  768: 8,
  default: 10,
};

export default function Home() {
  return (
    <div className="p-5">
      <Masonry columns={columns} spacing={spacing}>
        <Infinite />
      </Masonry>
    </div>
  );
}
