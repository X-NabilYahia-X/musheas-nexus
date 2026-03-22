#!/bin/bash
# =========================================
# Musheas Nexus — رفع تلقائي على GitHub + Vercel
# شغّل هذا الملف مرة واحدة فقط
# =========================================

set -e
REPO_NAME="musheas-nexus"
GITHUB_USER=$(git config user.name 2>/dev/null || echo "")

echo "🍄 Musheas Nexus — Deploy Script"
echo "================================="

# 1. تأكد من وجود git
if ! command -v git &> /dev/null; then
  echo "❌ git غير مثبت"; exit 1
fi

# 2. اطلب GitHub token إن لم يكن موجوداً
if [ -z "$GITHUB_TOKEN" ]; then
  echo ""
  echo "📌 احتاج Personal Access Token من GitHub"
  echo "   اذهب إلى: https://github.com/settings/tokens/new"
  echo "   حدد: repo (Full control)"
  read -p "   الصق الـ Token هنا: " GITHUB_TOKEN
fi

# 3. اطلب اسم المستخدم
if [ -z "$GITHUB_USER" ] || [ "$GITHUB_USER" = "" ]; then
  read -p "📌 اسم مستخدم GitHub: " GITHUB_USER
fi

echo ""
echo "⏳ جاري إنشاء Repository على GitHub..."

# 4. أنشئ الـ repo عبر GitHub API
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "https://api.github.com/user/repos" \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$REPO_NAME\",\"private\":true,\"description\":\"Musheas Nexus - Dashboard بيوتكنولوجيا\"}")

if [ "$RESPONSE" = "201" ] || [ "$RESPONSE" = "422" ]; then
  echo "✅ Repository جاهز"
else
  echo "❌ خطأ في إنشاء Repository (HTTP $RESPONSE)"; exit 1
fi

# 5. Push
git remote remove origin 2>/dev/null || true
git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"
git branch -M main
git push -u origin main --force

echo ""
echo "✅ تم الرفع على GitHub!"
echo "   https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""

# 6. Vercel CLI
if command -v vercel &> /dev/null; then
  echo "⏳ جاري النشر على Vercel..."
  vercel --prod \
    --env NEXT_PUBLIC_SUPABASE_URL=https://jlxzluwdbpcombkdtnyz.supabase.co \
    --env NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseHpsdXdkYnBjb21ia2R0bnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTA2NjgsImV4cCI6MjA4OTcyNjY2OH0.QG-1t8im9xO8EJLrNdALl-vTEtaIEq_z3LFj2odEM0A \
    --yes
else
  echo "📌 الخطوة الأخيرة: اذهب إلى https://vercel.com/new"
  echo "   - اختر الـ Repo: $GITHUB_USER/$REPO_NAME"
  echo "   - أضف المتغيرات من ملف .env.local"
  echo "   - اضغط Deploy ✅"
fi
