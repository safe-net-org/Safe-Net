# Branch consolidation — 30 September 2026

Target: `main`, through PR #17. The integration branch contains every branch head listed below. The duplicated main, password-reset and security commits were confirmed as patch-equivalent before joining their histories. The integration tree matched `01c12f1` exactly before this documentation update.

Old branch names can be restored from these commit IDs; their commits remain reachable from the unified history.

| Branch before consolidation | Commit |
|---|---|
| `Dev-PGVAA-patch-1` | `91e36e44d026016e31b3486907d00a9ce544513a` |
| `Dev-PGVAA-patch-2` | `5c767839c0e6858bd4c5f85868b357f6cec9e9a3` |
| `Dev-PGVAA-patch-3` | `819bb82a37493807a58abd156b9192704a299706` |
| `feature/add-data-template` | `c28c153b6a9401980f0b8dc30029a9f747e24475` |
| `feature/add-licence-readme-and-edit-documentation` | `0e79454fccedbbe0dd89a7e65438e9e70925523c` |
| `feature/add-project-preview` | `17934884cd176e675b09d097b2507a872a2b9681` |
| `feature/admin-panel` | `9e54304fb086b3a06352da344d1e7bb146da754e` |
| `feature/admin-part` | `311b72fe0ae370f19119adea929a28f9bd279157` |
| `main` | `5cce1b0f69a82e3c043f9c150b70e7ee6dc56729` |
| `upd/password-reset-delivery` | `24b253cff9261eec22588c73b5905ead9ab7157e` |
| `upd/portfolio-localization` | `9856d4a38d96a23ff647abe799436bba4ee7196c` |


This operation does not change application code or database records. Source, migrations, presentation files and prior verification records are preserved. Historical audit references keep their original branch names.

## CI state before consolidation

GitHub run [36768109815](https://github.com/safe-net-org/Safe-Net/actions/runs/36768109815) passed six checks: tracked-secret files, client, Guard engine, extension, ML scoring, and isolated PostgreSQL/HTTP scenarios. Two checks failed: the server TypeScript job could not resolve Jest globals in spec files; the dependency advisory job reported 53 high/critical findings in the dependency graph. No application changes were made to suppress these findings. Dependency remediation and the CI type-resolution fix remain separate work.
