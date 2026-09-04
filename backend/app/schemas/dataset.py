from pydantic import BaseModel
from typing import List, Optional

class DatasetBase(BaseModel):
    id: str
    name: str
    provider: str
    type: str
    variables: List[str]
    region: str
    time_coverage: str
    resolution: str
    status: str
    protocol: Optional[str] = "ERDDAP"
    endpoint_url: Optional[str] = None

class DatasetResponse(DatasetBase):
    class Config:
        from_attributes = True

class DatasetFilterParams(BaseModel):
    type: Optional[str] = None
    query: Optional[str] = None
    variable: Optional[str] = None
    region: Optional[str] = None
