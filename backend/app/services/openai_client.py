from openai import OpenAI

from .. import config

_client = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=config.OPENAI_API_KEY)
    return _client


def complete(system: str, user: str, max_tokens: int = 1500, json_mode: bool = False) -> str:
    client = get_client()
    kwargs = {}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    response = client.chat.completions.create(
        model=config.OPENAI_MODEL,
        max_completion_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        **kwargs,
    )
    return response.choices[0].message.content or ""
