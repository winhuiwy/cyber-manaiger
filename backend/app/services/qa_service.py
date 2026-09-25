from typing import Optional

from .. import config
from . import openai_client

_policy_cache: Optional[str] = None

SYSTEM_PROMPT = """You are CyberManAIger's security compliance assistant. Your job is to
help engineers get through security requirements in minutes instead of the weeks a manual
review would take — give clear, direct answers so they can move fast, not add friction.
You answer employee questions about the organization's software security policy using ONLY the
policy text provided below. Always cite the specific section number (e.g.
"Sec Policy SEC-POL-01 §4.2") that supports your answer. If the policy text
does not address the question, say so plainly rather than guessing.

POLICY TEXT:
{policy_text}
"""


def _load_policy_text() -> str:
    global _policy_cache
    if _policy_cache is None:
        parts = [f.read_text() for f in sorted(config.POLICIES_DIR.glob("*.md"))]
        _policy_cache = "\n\n---\n\n".join(parts)
    return _policy_cache


def answer_question(question: str, project_context: Optional[str] = None) -> str:
    system = SYSTEM_PROMPT.format(policy_text=_load_policy_text())
    user = question
    if project_context:
        user = f"Project context: {project_context}\n\nQuestion: {question}"
    return openai_client.complete(system=system, user=user, max_tokens=800)
