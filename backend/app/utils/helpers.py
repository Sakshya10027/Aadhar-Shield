from typing import Dict, List, Optional


def parse_list_param(param: Optional[str]) -> List[str]:
    if not param:
        return []
    return [p.strip() for p in param.split(",") if p.strip()]

