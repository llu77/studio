
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CirclePlus, Printer, Trash2, Search, ShoppingCart } from "lucide-react";
import React, { useState, useMemo, useContext, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserContext, BranchContext } from "@/app/(app)/layout";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

// --- Data ---
const initialProducts = [
    { id: 'PROD01', name: 'قهوة مختصة', price: 15.00, image: '/images/coffee.jpg', category: 'مشروبات حارة' },
    { id: 'PROD02', name: 'شاي كرك', price: 8.00, image: '/images/karak.jpg', category: 'مشروبات حارة' },
    { id: 'PROD03', name: 'كرواسون جبن', price: 10.00, image: '/images/croissant.jpg', category: 'مخبوزات' },
    { id: 'PROD04', name: 'كيكة العسل', price: 20.00, image: '/images/honey-cake.jpg', category: 'حلويات' },
    { id: 'PROD05', name: 'موهيتو', price: 12.00, image: '/images/mojito.jpg', category: 'مشروبات باردة' },
    { id: 'PROD06', name: 'كوكيز', price: 7.00, image: '/images/cookies.jpg', category: 'حلويات' },
];

type Product = typeof initialProducts[0];
type CartItem = {
    product: Product;
    quantity: number;
};

// --- Invoice Component ---
const Invoice = ({ cart, total }: { cart: CartItem[], total: number }) => {
    const { currentBranch } = useContext(BranchContext);
    const { user } = useAuth();
    const branchName = currentBranch === 'laban' ? 'فرع لبن' : 'فرع طويق';
    const today = new Date().toLocaleDateString('ar-SA');
    const vat = total * 0.15;
    const grandTotal = total + vat;

    return (
        <div className="printable-content p-6 bg-card text-card-foreground rounded-lg border">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-primary">فاتورة طلبات ضريبية مبسطة</h2>
                <p className="text-sm text-muted-foreground">{branchName}</p>
            </div>
            <div className="flex justify-between text-sm mb-4">
                <span><span className="font-semibold">الموظف:</span> {user?.displayName || "غير محدد"}</span>
                <span><span className="font-semibold">التاريخ:</span> {today}</span>
            </div>
            <Separator className="my-4"/>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cart.map(item => (
                        <TableRow key={item.product.id}>
                            <TableCell>{item.product.name}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right font-mono">{(item.product.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Separator className="my-4"/>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">الإجمالي الفرعي</span>
                    <span className="font-semibold font-mono">{total.toFixed(2)} ريال</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
                    <span className="font-semibold font-mono">{vat.toFixed(2)} ريال</span>
                </div>
                 <Separator className="my-2"/>
                <div className="flex justify-between items-center text-lg font-bold text-primary">
                    <span>الإجمالي للدفع</span>
                    <span className="font-mono">{grandTotal.toFixed(2)} ريال</span>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function ProductRequestsPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    
    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    const handleAddToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { product, quantity: 1 }];
        });
    };
    
    const handleRemoveFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            handleRemoveFromCart(productId);
            return;
        }
        setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: newQuantity } : item));
    };
    
    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const handlePrint = () => {
        window.print();
    };

    const handleClearCart = () => {
        setCart([]);
        toast({
            variant: "destructive",
            title: "تم إلغاء فاتورة الطلبات",
            description: "تم مسح جميع المنتجات من السلة.",
        });
    }

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Side: Invoice and Actions */}
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <CardTitle>فاتورة الطلبات الحالية</CardTitle>
                            <CardDescription>إجمالي {cart.length} منتجات</CardDescription>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Button size="lg" disabled={cart.length === 0} onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                طباعة
                            </Button>
                            <Button variant="destructive" size="lg" disabled={cart.length === 0} onClick={handleClearCart}>
                                إلغاء
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                                <ShoppingCart className="h-12 w-12 mb-4" />
                                <h3 className="text-lg font-semibold">فاتورة الطلبات فارغة</h3>
                                <p>أضف منتجات من القائمة لبدء فاتورة جديدة.</p>
                            </div>
                        ) : (
                            <Invoice cart={cart} total={total} />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Side: Products List */}
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>قائمة المنتجات</CardTitle>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="ابحث عن منتج..." 
                                className="pl-10" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto p-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="flex items-center gap-4 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                                <Image data-ai-hint={`${product.category}`} src={`https://picsum.photos/seed/${product.id}/100/100`} alt={product.name} width={64} height={64} className="rounded-md object-cover" />
                                <div className="flex-grow">
                                    <h4 className="font-semibold">{product.name}</h4>
                                    <p className="text-sm text-muted-foreground">{product.price.toFixed(2)} ريال</p>
                                </div>
                                <Button size="icon" variant="outline" onClick={() => handleAddToCart(product)}>
                                    <CirclePlus className="h-5 w-5 text-primary" />
                                </Button>
                            </div>
                        ))}
                            {filteredProducts.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">لا توجد منتجات تطابق بحثك.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
