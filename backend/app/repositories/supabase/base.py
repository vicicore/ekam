from typing import Any


class SupabaseRepositoryError(RuntimeError):
    pass


class SupabaseTable:
    def __init__(self, table: str) -> None:
        self.table = table

    @property
    def client(self):
        # Lazy import keeps local/demo installations independent of the
        # optional Supabase SDK until persistence_backend=supabase is used.
        from app.db.supabase_client import get_supabase_admin
        return get_supabase_admin()

    def insert(self, row: dict[str, Any]) -> dict[str, Any]:
        result = self.client.table(self.table).insert(row).execute()
        if not result.data:
            raise SupabaseRepositoryError(f"Insert returned no row for {self.table}")
        return result.data[0]

    def upsert(self, row: dict[str, Any]) -> dict[str, Any]:
        result = self.client.table(self.table).upsert(row).execute()
        if not result.data:
            raise SupabaseRepositoryError(f"Upsert returned no row for {self.table}")
        return result.data[0]

    def one(self, column: str, value: Any) -> dict[str, Any] | None:
        result = self.client.table(self.table).select("*").eq(column, value).limit(1).execute()
        return result.data[0] if result.data else None

    def many(self, column: str | None = None, value: Any = None, limit: int | None = None):
        query = self.client.table(self.table).select("*")
        if column is not None:
            query = query.eq(column, value)
        if limit is not None:
            query = query.limit(limit)
        result = query.execute()
        return result.data or []

    def delete(self, column: str, value: Any) -> None:
        self.client.table(self.table).delete().eq(column, value).execute()
