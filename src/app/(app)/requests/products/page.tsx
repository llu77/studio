
'use client';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CirclePlus, Printer, Trash2, MinusCircle, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState } from "react";

const products = [
    { id: 'PROD01', name: 'قهوة مختصة', price: 15.00 },
    { id: 'PROD02', name: 'شاي كرك', price: 8.00 },
    { id: 'PROD03', name: 'كرواسون جبن', price: 10.00 },
    { id: 'PROD04', name: 'كيكة العسل', price: 20.00 },
];

type CartItem = {
    product: typeof products[0];
    quantity: number;
};

export default function ProductRequestsPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>("");

    const handleAddProduct = () => {
        if (!selectedProduct) return;
        const productToAdd = products.find(p => p.id === selectedProduct);
        if (!productToAdd) return;

        const existingItem = cart.find(item => item.product.id === productToAdd.id);
        if (existingItem) {
            setCart(cart.map(item => item.product.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { product: productToAdd, quantity: 1 }]);
        }
    };
    
    const handleRemoveItem = (productId: string) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };
    
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>إنشاء فاتورة جديدة</CardTitle>
                    <CardDescription>أضف المنتجات لإنشاء فاتورة جديدة للعميل.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4">
                        <Select onValueChange={setSelectedProduct}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر منتجاً لإضافته..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAddProduct}>
                            <CirclePlus className="mr-2 h-4 w-4" />
                            إضافة للفاتورة
                        </Button>
                    </div>
                     <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>المنتج</TableHead>
                                    <TableHead>الكمية</TableHead>
                                    <TableHead>سعر الوحدة</TableHead>
                                    <TableHead>الإجمالي</TableHead>
                                    <TableHead>حذف</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cart.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                            الفاتورة فارغة.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {cart.map(item => (
                                    <TableRow key={item.product.id}>
                                        <TableCell>{item.product.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{item.product.price.toFixed(2)} ريال</TableCell>
                                        <TableCell>{(item.product.price * item.quantity).toFixed(2)} ريال</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleRemoveItem(item.product.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>ملخص الفاتورة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">الإجمالي الفرعي</span>
                        <span className="font-semibold">{total.toFixed(2)} ريال</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
                        <span className="font-semibold">{(total * 0.15).toFixed(2)} ريال</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between items-center text-lg font-bold text-primary">
                        <span>الإجمالي للدفع</span>
                        <span>{(total * 1.15).toFixed(2)} ريال</span>
                    </div>
                     <div className="space-y-2">
                        <Button size="lg" className="w-full" disabled={cart.length === 0}>
                            <Printer className="mr-2 h-4 w-4" />
                            طباعة الفاتورة
                        </Button>
                        <Button variant="outline" className="w-full" disabled={cart.length === 0} onClick={() => setCart([])}>
                           إلغاء الفاتورة
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
