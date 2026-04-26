import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfigService } from '../../../core/services/config.service';
import { CONFIG_KEYS } from '../../../core/models/system-config.model';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Theme/system-config editor.
 * Allows ADMIN users to change company branding, colors, and module visibility
 * without redeploying. Changes are saved to SystemConfig table via API and
 * immediately reflected in the UI through ThemeService.
 */
@Component({
  selector: 'app-system-config',
  templateUrl: './system-config.component.html',
  styleUrls: ['./system-config.component.scss']
})
export class SystemConfigComponent implements OnInit {

  form!:   FormGroup;
  saving = false;

  constructor(
    private readonly fb:            FormBuilder,
    private readonly configService: ConfigService,
    private readonly snack:         MatSnackBar
  ) {}

  ngOnInit(): void {
    const cfg = this.configService.getAll();
    this.form = this.fb.group({
      [CONFIG_KEYS.COMPANY_NAME]:      [cfg[CONFIG_KEYS.COMPANY_NAME]      || 'ERP Platform'],
      [CONFIG_KEYS.COMPANY_LOGO_URL]:  [cfg[CONFIG_KEYS.COMPANY_LOGO_URL]  || ''],
      [CONFIG_KEYS.PRIMARY_COLOR]:     [cfg[CONFIG_KEYS.PRIMARY_COLOR]     || '#1976D2'],
      [CONFIG_KEYS.SECONDARY_COLOR]:   [cfg[CONFIG_KEYS.SECONDARY_COLOR]   || '#424242'],
      [CONFIG_KEYS.ACCENT_COLOR]:      [cfg[CONFIG_KEYS.ACCENT_COLOR]      || '#FF4081'],
      [CONFIG_KEYS.FONT_FAMILY]:       [cfg[CONFIG_KEYS.FONT_FAMILY]       || 'Roboto, sans-serif'],
      [CONFIG_KEYS.ENABLED_MODULES]:   [cfg[CONFIG_KEYS.ENABLED_MODULES]   || '["customers","products","orders","stock"]'],
    });
  }

  save(): void {
    this.saving = true;
    const updates = Object.entries(this.form.value).map(([key, value]) => ({
      configKey: key,
      configValue: String(value),
    }));

    this.configService.saveBulk(updates).subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Configuration saved!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snack.open('Failed to save config', 'Close', { duration: 4000 });
      }
    });
  }

  get keys() { return CONFIG_KEYS; }
}
