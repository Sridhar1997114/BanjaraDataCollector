Set-Location "f:\Banjara AI\BanjaraDataCollector"
Write-Output "--- GIT STATUS ---" | Out-File -FilePath deploy_log.txt -Encoding utf8
git status | Out-File -FilePath deploy_log.txt -Append -Encoding utf8
Write-Output "--- GIT REMOTE ---" | Out-File -FilePath deploy_log.txt -Append -Encoding utf8
git remote -v | Out-File -FilePath deploy_log.txt -Append -Encoding utf8
Write-Output "--- GIT PUSH ATTEMPT ---" | Out-File -FilePath deploy_log.txt -Append -Encoding utf8
git push origin main 2>&1 | Out-File -FilePath deploy_log.txt -Append -Encoding utf8
Write-Output "--- FINISHED ---" | Out-File -FilePath deploy_log.txt -Append -Encoding utf8
