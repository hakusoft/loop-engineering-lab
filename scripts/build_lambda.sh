#!/usr/bin/env bash
# Lambda のデプロイパッケージを作る。
#
#   ./scripts/build_lambda.sh
#
# 依存は Lambda の実行環境(Linux/x86_64)向けに解決する。
# Mac で普通に pip install したものを固めると、ネイティブ拡張が動かない。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="${ROOT}/infra/build"
STAGE_DIR="${BUILD_DIR}/package"
ZIP_PATH="${BUILD_DIR}/lambda.zip"

rm -rf "${STAGE_DIR}" "${ZIP_PATH}"
mkdir -p "${STAGE_DIR}"

# pip は venv 内のものを優先する（素の `pip` は環境によって存在しない）
if [ -x "${ROOT}/.venv/bin/pip" ]; then
  PIP="${ROOT}/.venv/bin/pip"
elif command -v pip3 >/dev/null 2>&1; then
  PIP="pip3"
else
  PIP="python3 -m pip"
fi

echo "==> 依存を Linux 向けに解決 (${PIP})"
${PIP} install \
  --quiet \
  --target "${STAGE_DIR}" \
  --platform manylinux2014_x86_64 \
  --implementation cp \
  --python-version 3.12 \
  --only-binary=:all: \
  -r "${ROOT}/requirements.txt"

echo "==> アプリを同梱"
cp -r "${ROOT}/app" "${STAGE_DIR}/app"

# __pycache__ はサイズを増やすだけなので落とす
find "${STAGE_DIR}" -name '__pycache__' -type d -prune -exec rm -rf {} + 2>/dev/null || true

echo "==> zip を作成"
(cd "${STAGE_DIR}" && zip -qr "${ZIP_PATH}" .)

echo "==> 完成: ${ZIP_PATH} ($(du -h "${ZIP_PATH}" | cut -f1))"
