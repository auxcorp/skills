#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["google-api-python-client>=2.0.0", "google-auth>=2.0.0", "click>=8.0.0"]
# ///
"""Gmail commands."""

import base64
from email.mime.text import MIMEText
from pathlib import Path

import click
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TOKEN_FILE = Path.home() / ".simple-google-workspace" / "token.json"


def get_service():
    if not TOKEN_FILE.exists():
        raise click.ClickException("Not authenticated. Run: uv run scripts/auth.py login")
    creds = Credentials.from_authorized_user_file(TOKEN_FILE)
    return build("gmail", "v1", credentials=creds)


def get_headers(msg):
    return {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}


@click.group()
def cli():
    """Gmail commands."""


@cli.command("list")
@click.option("-q", "--query", help="Gmail search query")
@click.option("-n", "--limit", default=10, help="Max results")
def list_messages(query: str, limit: int):
    """List recent emails."""
    service = get_service()
    results = service.users().messages().list(
        userId="me", q=query, maxResults=limit
    ).execute()

    messages = results.get("messages", [])
    if not messages:
        click.echo("No messages found.")
        return

    for m in messages:
        msg = service.users().messages().get(
            userId="me", id=m["id"], format="metadata", metadataHeaders=["From", "Subject"]
        ).execute()
        h = get_headers(msg)
        click.echo(f"[{m['id']}] {h.get('Subject', '(No subject)')}")
        click.echo(f"  From: {h.get('From', 'Unknown')}")


@cli.command()
@click.argument("query")
def search(query: str):
    """Search emails."""
    service = get_service()
    results = service.users().messages().list(userId="me", q=query, maxResults=10).execute()

    messages = results.get("messages", [])
    if not messages:
        click.echo("No messages found.")
        return

    for m in messages:
        msg = service.users().messages().get(
            userId="me", id=m["id"], format="metadata", metadataHeaders=["From", "Subject"]
        ).execute()
        h = get_headers(msg)
        click.echo(f"[{m['id']}] {h.get('Subject', '(No subject)')}")


@cli.command()
@click.argument("message_id")
def get(message_id: str):
    """Read email content."""
    service = get_service()
    msg = service.users().messages().get(userId="me", id=message_id, format="full").execute()
    h = get_headers(msg)

    click.echo(f"From: {h.get('From', 'Unknown')}")
    click.echo(f"To: {h.get('To', 'Unknown')}")
    click.echo(f"Subject: {h.get('Subject', '(No subject)')}")
    click.echo("-" * 40)

    payload = msg.get("payload", {})
    body = ""
    if "body" in payload and payload["body"].get("data"):
        body = base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8")
    elif "parts" in payload:
        for part in payload["parts"]:
            if part.get("mimeType") == "text/plain" and part.get("body", {}).get("data"):
                body = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8")
                break

    click.echo(body or "(No text body)")


@cli.command()
@click.argument("to")
@click.argument("subject")
@click.argument("body")
def send(to: str, subject: str, body: str):
    """Send email."""
    service = get_service()

    message = MIMEText(body)
    message["to"] = to
    message["subject"] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")

    service.users().messages().send(userId="me", body={"raw": raw}).execute()
    click.echo(f"Email sent to {to}")


@cli.command()
@click.argument("to")
@click.argument("subject")
@click.argument("body")
def draft(to: str, subject: str, body: str):
    """Create draft email."""
    service = get_service()

    message = MIMEText(body)
    message["to"] = to
    message["subject"] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")

    result = service.users().drafts().create(
        userId="me", body={"message": {"raw": raw}}
    ).execute()
    click.echo(f"Draft created: {result.get('id')}")


@cli.command()
def labels():
    """List Gmail labels."""
    service = get_service()
    results = service.users().labels().list(userId="me").execute()
    for label in results.get("labels", []):
        click.echo(f"- {label['name']} [{label['id']}]")


if __name__ == "__main__":
    cli()
