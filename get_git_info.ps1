Set-Location "f:\Banjara AI\BanjaraDataCollector"
Write-Output "--- GIT LOG ---" | Out-File -FilePath git_debug_final.txt -Encoding utf8
git log -n 5 --oneline | Out-File -FilePath git_debug_final.txt -Append -Encoding utf8
Write-Output "--- GIT BRANCH ---" | Out-File -FilePath git_debug_final.txt -Append -Encoding utf8
git branch -a | Out-File -FilePath git_debug_final.txt -Append -Encoding utf8
