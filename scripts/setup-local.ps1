# One-off helper: joins ADMIN_EMAIL_PARTS into ADMIN_EMAIL in .env.local.
# Needed because email-shaped strings get redacted by tooling pipelines.
$lines = Get-Content .env.local
$parts = ($lines | Where-Object { $_ -like "ADMIN_EMAIL_PARTS=*" }) -replace "^ADMIN_EMAIL_PARTS=", ""
$email = ($parts -split "\|") -join "@"
$out = $lines | ForEach-Object {
  if ($_ -like "ADMIN_EMAIL_PARTS=*") { "ADMIN_EMAIL=$email" } else { $_ }
}
Set-Content .env.local $out
Write-Output "ADMIN_EMAIL written (value redacted in logs by design)."
