/** @format */

import { Component } from '@angular/core';
import { APIService } from 'src/app/api/api.service';
import { SpinnerService } from 'src/app/components/spinner/spinner.service';
import { ActivatedRoute } from '@angular/router';
import {
  Guild,
  Role,
  Member,
  Report,
  GuildSettings,
  Channel,
  GuildBackup,
} from 'src/app/api/api.models';
import { ToastService } from 'src/app/components/toast/toast.service';
import { toHexClr, topRole } from '../../utils/utils';
import dateFormat from 'dateformat';

interface Perms {
  id: string;
  role: Role;
  perms: string[];
}

@Component({
  selector: 'app-guild',
  templateUrl: './guild.component.html',
  styleUrls: ['./guild.component.sass'],
})
export class GuildComponent {
  public readonly MAX_SHOWN_USERS = 200;
  public readonly MAX_SHOWN_MODLOG = 20;
  public readonly MAX_LOAD_USERS = 1000;

  public guild: Guild;
  public members: Member[];
  public membersDisplayed: Member[];
  public reports: Report[];
  public reportsTotalCount: number;
  public allowed: string[];
  public settings: GuildSettings;
  public updatedSettings: GuildSettings = {} as GuildSettings;
  public backups: GuildBackup[];

  public guildSettingsAllowed: string[] = [];

  public addPermissionPerm: string;
  public addPermissionRoles: Role[] = [];
  public addPermissionAllow = true;

  public guildToggle = false;
  public modlogToggle = false;
  public guildSettingsToggle = false;
  public permissionsToggle = false;
  public backupsToggle = false;

  public isSearchInput = false;

  public memberDisplayMoreLoading = false;
  public reportDisplayMoreLoading = false;

  public toHexClr = toHexClr;
  public dateFormat = dateFormat;

  constructor(
    private api: APIService,
    private route: ActivatedRoute,
    private toasts: ToastService
  ) {
    const guildID = this.route.snapshot.paramMap.get('id');
    this.api.getGuild(guildID).subscribe((guild) => {
      this.guild = guild;

      if (this.members) {
        this.guild.members = this.members;
      }

      this.api
        .getPermissionsAllowed(guildID, guild.self_member.user.id)
        .subscribe((allowed) => {
          this.allowed = allowed;
          this.guildSettingsAllowed = this.allowed.filter(
            (a) =>
              a.startsWith('sp.guild.config') || a.startsWith('sp.guild.admin')
          );
        });
    });

    this.loadMembers(guildID, () => {
      this.membersDisplayed = this.members.slice(0, this.MAX_SHOWN_USERS);
    });

    this.api.getGuildSettings(guildID).subscribe((settings) => {
      this.settings = settings;
    });

    this.api
      .getReports(guildID, null, 0, this.MAX_SHOWN_MODLOG)
      .subscribe((reports) => {
        this.reports = reports;
      });

    this.api.getReportsCount(guildID).subscribe((count) => {
      this.reportsTotalCount = count;
    });

    this.api.getGuildBackups(guildID).subscribe((backups) => {
      this.backups = backups.data;
    });
  }

  private loadMembers(guildID: string, cb: () => void) {
    const membersLen = this.members ? this.members.length : 0;
    const lastMember =
      this.members && membersLen > 0 ? this.members[membersLen - 1] : null;
    this.api
      .getGuildMembers(
        guildID,
        lastMember ? lastMember.user.id : '',
        this.MAX_LOAD_USERS
      )
      .subscribe((members) => {
        if (!this.members) {
          this.members = [];
        }

        this.members = this.members.concat(members);

        if (this.guild) {
          this.guild.members = this.members;
        }

        cb();
      });
  }

  public get userRoles(): Role[] {
    const userRoleIDs = this.guild.self_member.roles;
    return this.guild.roles
      .filter((r) => userRoleIDs.includes(r.id))
      .sort((a, b) => b.position - a.position);
  }

  public get lastBackupText(): string {
    if (this.guild.latest_backup_entry.toString() === '0001-01-01T00:00:00Z') {
      return 'No backups are available for this guild.';
    }

    return `Last backup was created at ${dateFormat(
      this.guild.latest_backup_entry
    )}.`;
  }

  public getBackupDownloadLink(backupID: string): string {
    return this.api.getRcGuildBackupDownload(this.guild.id, backupID);
  }

  public searchInput(e: any) {
    const val = e.target.value.toLowerCase();

    if (val === '') {
      this.membersDisplayed = this.members.slice(0, this.MAX_SHOWN_USERS);
      this.isSearchInput = false;
    } else {
      this.membersDisplayed = this.members.filter(
        (m) =>
          (m.nick && m.nick.toLowerCase().includes(val)) ||
          m.user.username.toLowerCase().includes(val) ||
          m.user.id.includes(val)
      );
      this.isSearchInput = true;
    }
  }

  public guildSettingsContains(str: string): boolean {
    return this.guildSettingsAllowed.includes(str);
  }

  public saveGuildSettings() {
    this.api
      .postGuildSettings(this.guild.id, this.updatedSettings)
      .subscribe((res) => {
        if (res.code === 200) {
          this.toasts.push(
            'Guild settings updated.',
            'Guild Settings Update',
            'success',
            6000,
            true
          );
        }
      });
  }

  public getSelectedValue(e: any): string {
    const t = e.target;
    const val = t.options[t.selectedIndex].value;
    if (val.match(/\d+:\s.+/g)) {
      return val.split(' ').slice(1).join(' ');
    }
    return val;
  }

  public channelsByType(a: Channel[], type: number): Channel[] {
    return a.filter((c) => c.type === type);
  }

  public fetchGuildPermissions() {
    this.api.getGuildPermissions(this.guild.id).subscribe((perms) => {
      this.settings.perms = perms;
    });
  }

  public getRoleByID(roleID: string): Role {
    return this.guild.roles.find((r) => r.id === roleID);
  }

  public objectAsArray(obj: any): Perms[] {
    if (!obj) {
      return [];
    }

    return Object.keys(obj).map<Perms>((k) => {
      return { id: k, role: this.getRoleByID(k), perms: obj[k] };
    });
  }

  public removePermission(p: Perms, perm: string) {
    const prefix = perm.startsWith('+') ? '-' : '+';
    perm = prefix + perm.substr(1);
    this.api
      .postGuildPermissions(this.guild.id, { role_ids: [p.id], perm })
      .subscribe(() => {
        this.fetchGuildPermissions();
      });
  }

  public roleNameFormatter(r: Role): string {
    return r.name;
  }

  public addPermissionRule() {
    if (!this.addPermissionPerm || this.addPermissionRoles.length === 0) {
      return;
    }

    if (!this.addPermissionPerm.match(/(chat|guild|etc)\..+/g)) {
      this.toasts.push(
        'You can only manage permissions over the domains "sp.guild", "sp.etc" and "sp.chat".',
        'Error',
        'error',
        8000,
        true
      );
      return;
    }

    this.api
      .postGuildPermissions(this.guild.id, {
        perm: `${this.addPermissionAllow ? '+' : '-'}sp.${
          this.addPermissionPerm
        }`,
        role_ids: this.addPermissionRoles.map((r) => r.id),
      })
      .subscribe((res) => {
        if (res.code === 200) {
          this.addPermissionAllow = true;
          this.addPermissionPerm = '';
          this.addPermissionRoles = [];
          this.fetchGuildPermissions();
        }
      });
  }

  public displayMoreMembers() {
    this.memberDisplayMoreLoading = true;

    const currVisible = this.membersDisplayed.length;

    const append = () => {
      this.membersDisplayed = this.membersDisplayed.concat(
        this.members.slice(currVisible, currVisible + this.MAX_SHOWN_USERS)
      );
      this.memberDisplayMoreLoading = false;
    };

    if (currVisible + this.MAX_SHOWN_USERS > this.members.length) {
      this.loadMembers(this.guild.id, append);
    } else {
      append();
    }
  }

  public displayMoreReports() {
    this.reportDisplayMoreLoading = true;
    const currLen = this.reports.length;
    this.api
      .getReports(this.guild.id, null, currLen, this.MAX_SHOWN_MODLOG)
      .subscribe((modlog) => {
        this.reports = this.reports.concat(modlog);
        this.reportDisplayMoreLoading = false;
      });
  }

  public toggleGuildBackup() {
    this.api
      .postGuildBackupToggle(this.guild.id, !this.guild.backups_enabled)
      .subscribe(() => {
        this.guild.backups_enabled = !this.guild.backups_enabled;
        this.toasts.push(
          `${
            this.guild.backups_enabled ? 'Enabled' : 'Disabled'
          } guild backups for guild ${this.guild.name}.`,
          'Guild Backups Updated',
          'cyan',
          6000,
          true
        );
      });
  }
}
