from pathlib import Path
import os


class Settings:
    def __init__(self) -> None:
        env_value = os.getenv("UIDAI_DATA_DIR")
        if env_value:
            self.data_dir = Path(env_value)
        else:
            self.data_dir = Path(__file__).resolve().parent.parent / "data"


settings = Settings()
