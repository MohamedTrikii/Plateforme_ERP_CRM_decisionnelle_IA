@echo off
:: ERP Platform – Arrêt rapide (raccourci Windows)
title ERP Platform - Arrêt
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0stop.ps1"
pause
