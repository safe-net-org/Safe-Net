"""Repack WXT output with stable entry order and timestamps."""

import sys
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

source, target = sys.argv[1:3]
with ZipFile(source) as built, ZipFile(target, "w") as release:
    for name in sorted(built.namelist()):
        if name.endswith("/"):
            continue
        original = built.getinfo(name)
        entry = ZipInfo(name, (1980, 1, 1, 0, 0, 0))
        entry.compress_type = ZIP_DEFLATED
        entry.external_attr = original.external_attr
        release.writestr(entry, built.read(name), compress_type=ZIP_DEFLATED, compresslevel=9)
