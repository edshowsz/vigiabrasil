import os

import tweepy
from dotenv import load_dotenv

load_dotenv()


class XClient:
    """Cliente para publicação de posts via API v2 do X (antigo Twitter) usando Tweepy."""

    def __init__(self):
        self.client = tweepy.Client(
            consumer_key=os.getenv("X_API_KEY"),
            consumer_secret=os.getenv("X_API_SECRET"),
            access_token=os.getenv("X_ACCESS_TOKEN"),
            access_token_secret=os.getenv("X_ACCESS_TOKEN_SECRET"),
        )
        self._username: str | None = None

    @property
    def username(self) -> str:
        """Obtém o username da conta autenticada (com cache)."""
        if self._username is None:
            me = self.client.get_me()
            self._username = me.data.username
        return self._username

    def publicar_post(self, texto: str) -> dict:
        """Publica um post no X e retorna os dados da resposta incluindo a URL."""
        response = self.client.create_tweet(text=texto)
        post_id = str(response.data["id"])
        url = f"https://x.com/{self.username}/status/{post_id}"
        return {"id": post_id, "text": texto, "url": url}
