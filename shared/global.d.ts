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
  title: string;
  text: string;
  memoryId: string;
  dateFrom: Date;
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

interface Portfolio {
  list: Project[];
}

interface Project {
  id: string;
  image: string | undefined;
  title: string;
  description: string;
}
