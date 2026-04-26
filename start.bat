@echo off
:: ERP Platform – Lanceur rapide (raccourci Windows)
:: Lance start.ps1 avec la politique d'exécution appropriée.

title ERP Platform - Démarrage
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0start.ps1"
pause
