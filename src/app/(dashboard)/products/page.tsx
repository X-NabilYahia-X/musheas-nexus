"use client";

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useProducts } from '@/hooks/useProducts';
import { PRODUCT_CATEGORIES as INITIAL_CATEGORIES } from '@/lib/constants';
import { Save, Package, Plus, Trash2, Tag, Layers, Database, Settings2, Edit2, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addAuditLog } from '@/lib/logger';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Product } from '@/types';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const { toast } = useToast();
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();

  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingCatValue, setEditingCatValue] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', price: 0, badge: 'جديد', description: '', stock: 0, active: true, category: INITIAL_CATEGORIES[0],
  });

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'الكل') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({ title: "خطأ في الإدخال", description: "الاسم والسعر ضروريان.", variant: "destructive" });
      return;
    }
    const result = await createProduct(newProduct as Omit<Product, 'id'>);
    if (result) {
      setIsAddDialogOpen(false);
      setNewProduct({ name: '', price: 0, badge: 'جديد', description: '', stock: 0, active: true, category: categories[0] });
      toast({ title: "✓ تمت الإضافة بنجاح", className: "bg-green/10 border-green text-green" });
    } else {
      toast({ title: "خطأ في الإضافة", variant: "destructive" });
    }
  };

  const updateProductField = async (id: string, field: keyof Product, value: any) => {
    setSavingId(id);
    await updateProduct(id, { [field]: value });
    setSavingId(null);
  };

  const handleDeleteProduct = async (product: Product) => {
    const ok = await deleteProduct(product.id);
    if (ok) toast({ title: `✓ تم حذف ${product.name}`, className: "bg-red/10 border-red text-red" });
  };

  const addCategory = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories([...categories, trimmed]);
    addAuditLog('product', 'إضافة تصنيف', `إضافة قسم: ${trimmed}`);
    setNewCatInput('');
    toast({ title: "✓ تمت إضافة التصنيف" });
  };

  const deleteCategory = (catName: string) => {
    if (categories.length <= 1) { toast({ title: "لا يمكن حذف كل التصنيفات", variant: "destructive" }); return; }
    const newCats = categories.filter(c => c !== catName);
    setCategories(newCats);
    if (activeCategory === catName) setActiveCategory('الكل');
    toast({ title: "تم حذف التصنيف" });
  };

  const saveEditedCategory = (index: number) => {
    const oldName = categories[index];
    const newName = editingCatValue.trim();
    if (!newName || oldName === newName) { setEditingCatIndex(null); return; }
    const newCats = [...categories];
    newCats[index] = newName;
    setCategories(newCats);
    if (activeCategory === oldName) setActiveCategory(newName);
    setEditingCatIndex(null);
    toast({ title: "تم تحديث اسم التصنيف" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <span className="mr-3 text-muted text-sm">جاري تحميل المنتجات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-8" dir="rtl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-headline text-gold">الكتالوج البيوتكنولوجي</h3>
            <p className="text-[10px] text-muted uppercase font-bold tracking-widest">إدارة المخزون والمنتجات المتاحة</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog open={isManageCatsOpen} onOpenChange={setIsManageCatsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-border-strong text-gold h-12 px-4 bg-surface2/50 hover:bg-gold/10 transition-all">
                  <Settings2 className="w-4 h-4 ml-2" /> إدارة التصنيفات
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-surface1 border-border text-text w-[95vw] sm:max-w-md rounded-2xl shadow-2xl" dir="rtl">
                <DialogHeader className="text-right">
                  <DialogTitle className="font-headline text-gold text-xl">إدارة أقسام الكتالوج</DialogTitle>
                  <DialogDescription className="text-xs text-muted">إضافة أقسام جديدة، تعديل الأسماء أو حذف التصنيفات.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-muted uppercase font-bold pr-1">إضافة قسم جديد</label>
                    <div className="flex gap-2">
                      <Input placeholder="اسم التصنيف..." value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} className="bg-surface2 h-11 text-sm border-border-strong" onKeyDown={(e) => e.key === 'Enter' && addCategory()} />
                      <Button onClick={addCategory} className="gold-gradient text-background px-4 h-11"><Plus className="w-5 h-5" /></Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-muted uppercase font-bold pr-1">الأقسام المتوفرة</label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {categories.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface2/40 border border-border/10 group hover:border-gold/30 transition-all">
                          {editingCatIndex === idx ? (
                            <div className="flex items-center gap-2 w-full">
                              <Input value={editingCatValue} onChange={(e) => setEditingCatValue(e.target.value)} className="bg-surface1 h-9 text-xs flex-1 border-gold/50" autoFocus onKeyDown={(e) => e.key === 'Enter' && saveEditedCategory(idx)} />
                              <Button size="sm" variant="ghost" className="text-green h-9 w-9 p-0" onClick={() => saveEditedCategory(idx)}><Check className="w-5 h-5" /></Button>
                              <Button size="sm" variant="ghost" className="text-red h-9 w-9 p-0" onClick={() => setEditingCatIndex(null)}><X className="w-5 h-5" /></Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3"><Layers className="w-4 h-4 text-gold/60" /><span className="text-sm font-medium">{cat}</span></div>
                              <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" className="text-muted hover:text-gold h-9 w-9 p-0" onClick={() => { setEditingCatIndex(idx); setEditingCatValue(categories[idx]); }}><Edit2 className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" className="text-red/60 hover:text-red h-9 w-9 p-0" onClick={() => deleteCategory(cat)}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter><Button variant="ghost" onClick={() => setIsManageCatsOpen(false)} className="text-muted hover:text-text">إغلاق</Button></DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gold-gradient text-background font-bold h-12 flex-1 sm:flex-none px-6 shadow-lg shadow-gold/10 active:scale-95 transition-transform"><Plus className="w-4 h-4 ml-2" /> منتج جديد</Button>
              </DialogTrigger>
              <DialogContent className="bg-surface1 border-border text-text w-[95vw] rounded-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader className="text-right">
                  <DialogTitle className="font-headline text-gold text-2xl">إضافة منتج للكتالوج</DialogTitle>
                  <DialogDescription className="text-xs text-muted">أدخل تفاصيل المنتج البيوتكنولوجي الجديد.</DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="space-y-1.5"><label className="text-[10px] text-muted uppercase font-bold pr-1 tracking-wider">الاسم التجاري</label><Input placeholder="مثال: Turkey Tail Extract" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="bg-surface2 h-11 text-sm border-border-strong" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-[10px] text-muted uppercase font-bold pr-1 tracking-wider">السعر (DA)</label><Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})} className="bg-surface2 font-code h-11 border-border-strong" /></div>
                    <div className="space-y-1.5"><label className="text-[10px] text-muted uppercase font-bold pr-1 tracking-wider">الكمية</label><Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="bg-surface2 font-code h-11 border-border-strong" /></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-[10px] text-muted uppercase font-bold pr-1 tracking-wider">التصنيف</label>
                    <Select value={newProduct.category} onValueChange={(val) => setNewProduct({...newProduct, category: val})}>
                      <SelectTrigger className="bg-surface2 h-11 text-right text-sm border-border-strong"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-surface1 border-border text-text">{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><label className="text-[10px] text-muted uppercase font-bold pr-1 tracking-wider">الوصف التقني</label><Textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="bg-surface2 min-h-[100px] text-sm border-border-strong" /></div>
                </div>
                <DialogFooter><Button onClick={handleAddProduct} className="gold-gradient text-background font-bold w-full h-12">حفظ في الكتالوج</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-2 py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button onClick={() => setActiveCategory('الكل')} className={cn("px-5 py-2.5 rounded-full text-[11px] font-bold transition-all border shrink-0", activeCategory === 'الكل' ? "bg-gold text-background border-gold shadow-lg shadow-gold/20" : "bg-surface1 text-muted border-border hover:border-gold/30")}>الكل</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-5 py-2.5 rounded-full text-[11px] font-bold transition-all border shrink-0", activeCategory === cat ? "bg-gold text-background border-gold shadow-lg shadow-gold/20" : "bg-surface1 text-muted border-border hover:border-gold/30")}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-surface1 border-border p-5 sm:p-6 space-y-5 group hover:border-gold/40 transition-all relative overflow-hidden shadow-sm">
            {savingId === product.id && <div className="absolute inset-0 bg-background/30 flex items-center justify-center z-10 rounded-xl"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-gold/10 transition-all" />
            <div className="flex justify-between items-start gap-4 relative">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Package className="w-6 h-6 text-gold" /></div>
                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-bold text-text leading-tight group-hover:text-gold transition-colors">{product.name}</h4>
                  <div className="flex flex-wrap gap-1.5"><span className="text-[8px] bg-gold/10 text-gold px-2 py-0.5 rounded border border-gold/20 font-bold uppercase tracking-tighter">{product.badge}</span><span className="text-[8px] bg-surface2 text-muted px-2 py-0.5 rounded border border-border font-bold uppercase tracking-tighter">{product.category}</span></div>
                </div>
              </div>
              <div className="text-left shrink-0">
                <p className="text-[8px] text-muted uppercase font-bold mb-1 tracking-wider">السعر</p>
                <div className="flex items-center gap-1">
                  <input type="number" defaultValue={product.price} onBlur={(e) => updateProductField(product.id, 'price', Number(e.target.value))} className="bg-transparent text-left font-code text-lg sm:text-xl font-bold text-gold focus:outline-none w-20 border-b border-transparent focus:border-gold/30 transition-all" />
                  <span className="text-[9px] text-muted font-bold uppercase">DA</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 bg-surface2/30 p-4 rounded-xl border border-border/20">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-[9px] text-muted uppercase font-bold flex items-center gap-1.5 tracking-wide"><Database className="w-3 h-3 text-gold" /> المخزون</label><input type="number" defaultValue={product.stock} onBlur={(e) => updateProductField(product.id, 'stock', Number(e.target.value))} className="bg-surface2 h-10 w-full rounded-lg px-3 border border-border/20 font-code text-xs focus:ring-1 focus:ring-gold outline-none transition-all" /></div>
                <div className="flex flex-col items-end justify-center gap-1.5"><label className="text-[9px] text-muted uppercase font-bold tracking-wide">{product.active ? 'متاح للبيع' : 'مخفي حالياً'}</label><Switch checked={product.active} onCheckedChange={(val) => updateProductField(product.id, 'active', val)} className="data-[state=checked]:bg-gold" /></div>
              </div>
              <div className="space-y-1.5"><label className="text-[9px] text-muted uppercase font-bold flex items-center gap-1.5 tracking-wide"><Layers className="w-3 h-3 text-gold" /> تغيير التصنيف</label>
                <Select value={product.category} onValueChange={(val) => updateProductField(product.id, 'category', val)}>
                  <SelectTrigger className="bg-surface2 h-10 text-right text-[10px] border-border/20 rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-surface1 border-border text-text">{categories.map(cat => <SelectItem key={cat} value={cat} className="text-[10px]">{cat}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><label className="text-[9px] text-muted uppercase font-bold flex items-center gap-1.5 tracking-wide"><Tag className="w-3 h-3 text-gold" /> الوصف التقني</label><Textarea defaultValue={product.description} onBlur={(e) => updateProductField(product.id, 'description', e.target.value)} className="bg-surface2 text-xs resize-none min-h-[80px] leading-relaxed border-border/20 rounded-lg" /></div>
            <div className="flex justify-between items-center pt-2">
              <div className="text-[9px] text-muted font-medium italic opacity-60">{product.active ? 'متاح' : 'مخفي'}</div>
              <Button variant="ghost" size="sm" className="text-red hover:bg-red/10 text-[10px] font-bold h-9 px-4" onClick={() => handleDeleteProduct(product)}>
                <Trash2 className="w-3.5 h-3.5 ml-2" /> حذف المنتج
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
