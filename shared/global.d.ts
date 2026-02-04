interface Memory {
  _id: string;
  title: string;
  text: string;
  dateFrom: Date;
  dateTo: Date | null;
  images: string[];
  chunks: string[];
  requiresSync: boolean;
}

interface Chunk {
  pageContent: string;
}

interface PineconeRecord {
  text: string;
  memoryId: string;
}

interface Stats {
  total: number;
  totalSync: number;
}

interface Paginated<T> {
  list: T;
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}
