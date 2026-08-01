#!/usr/bin/env python3
"""Verify the profile front door without third-party dependencies."""

from __future__ import annotations

import argparse
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"
MARKDOWN_LINK = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
IMAGE_SOURCE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*alt="([^"]+)"', re.I)
REQUIRED_DESTINATIONS = {
    "https://github.com/szl-holdings",
    "https://github.com/szl-holdings/a11oy",
    "https://a-11-oy.com",
    "https://a11oy.net",
    "https://huggingface.co/SZLHOLDINGS",
    "https://orcid.org/0009-0001-0110-4173",
}
REQUIRED_HEADINGS = {
    "# Stephen P. Lutar Jr.",
    "## Start with your question",
    "## Three programs, one evidence contract",
    "## How I label claims",
    "## Work with me",
}


def fail(message: str) -> None:
    raise ValueError(message)


def read_profile() -> str:
    raw = README.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        fail("README.md must be UTF-8 without a BOM")
    text = raw.decode("utf-8")
    if "\ufffd" in text:
        fail("README.md contains replacement characters")
    return text


def verify_content(text: str) -> list[str]:
    if len(text) > 6_000:
        fail("README.md exceeds the 6,000-character front-door budget")
    if text.count("\n# ") != 1:
        fail("README.md must contain exactly one H1")
    missing_headings = sorted(REQUIRED_HEADINGS.difference(text.splitlines()))
    if missing_headings:
        fail(f"missing required headings: {missing_headings}")

    images = IMAGE_SOURCE.findall(text)
    if len(images) != 1:
        fail("README.md must contain exactly one HTML image with alt text")
    image_path, alt = images[0]
    if len(alt.split()) < 6:
        fail("hero alt text must describe the image, not merely name it")
    resolved_image = (ROOT / image_path).resolve()
    if not resolved_image.is_relative_to(ROOT) or not resolved_image.is_file():
        fail(f"hero asset does not resolve inside the repository: {image_path}")

    links = MARKDOWN_LINK.findall(text)
    if not links:
        fail("README.md contains no links")
    destinations = {link.split("#", 1)[0].rstrip("/") for link in links}
    missing_destinations = sorted(REQUIRED_DESTINATIONS.difference(destinations))
    if missing_destinations:
        fail(f"missing required front-door links: {missing_destinations}")

    for link in links:
        parsed = urlparse(link)
        if parsed.scheme not in {"https", "mailto"}:
            fail(f"link must use https or mailto: {link}")
        if parsed.scheme == "https" and (
            parsed.query or parsed.fragment.startswith("utm_")
        ):
            fail(f"tracked or query-bearing link is not allowed: {link}")
    return sorted({link for link in links if link.startswith("https://")})


def check_url(url: str) -> tuple[int, str]:
    headers = {
        "User-Agent": "szl-profile-integrity/1.0 (+https://github.com/stephenlutar2-hash)"
    }
    last_error = "unknown error"
    for attempt in range(2):
        try:
            request = urllib.request.Request(url, headers=headers, method="GET")
            with urllib.request.urlopen(request, timeout=25) as response:
                return response.status, response.geturl()
        except (urllib.error.URLError, TimeoutError) as exc:
            last_error = str(exc)
            if attempt == 0:
                time.sleep(1)
    fail(f"unreachable link: {url}: {last_error}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--online", action="store_true", help="also fetch every HTTPS destination"
    )
    args = parser.parse_args()

    try:
        links = verify_content(read_profile())
        print(f"profile structure: PASS ({len(links)} unique HTTPS links)")
        if args.online:
            for link in links:
                status, final_url = check_url(link)
                if status < 200 or status >= 400:
                    fail(f"unexpected HTTP {status}: {link}")
                print(f"HTTP {status}  {link} -> {final_url}")
    except ValueError as exc:
        print(f"profile integrity: FAIL: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
