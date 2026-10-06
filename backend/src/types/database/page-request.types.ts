// Which rows a list query returns (built from page and pageSize)
export interface PageRequest {
  skip: number;
  take: number;
}
