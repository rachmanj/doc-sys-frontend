"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { AdditionalDocument } from "@/types/additional-document";
import { getCookie } from "@/lib/cookies";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AddocEditDetails } from "./addoc-edit-details";
import { AddocDistributions } from "./addoc-distributions";
import { AddocAttachments } from "./addoc-attachments";

interface AddocEditProps {
  id: string;
}

export const AddocEdit = ({ id }: AddocEditProps) => {
  const [document, setDocument] = useState<AdditionalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const token = getCookie("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/additional-documents/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch document");
        const result = await response.json();

        // Process distributions data to ensure it's in the correct format
        if (result.data && result.data.distributions) {
          result.data.distributions = result.data.distributions.map(
            (dist: any) => ({
              id: dist.id || `dist-${Math.random().toString(36).substr(2, 9)}`,
              location_code:
                typeof dist.location_code === "string"
                  ? dist.location_code
                  : "Unknown",
              created_at: dist.created_at || new Date().toISOString(),
            })
          );
        }

        setDocument(result.data);
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!document) {
    return <div>Document not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => router.push("/documents/additional-documents")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-white border-b border-gray-200 w-full justify-start space-x-8 rounded-none p-0">
          <TabsTrigger
            value="details"
            className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-4 py-3"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="distributions"
            className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-4 py-3"
          >
            Distributions
          </TabsTrigger>
          <TabsTrigger
            value="attachments"
            className="data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 border-b-2 border-transparent rounded-none px-4 py-3"
          >
            Attachments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <AddocEditDetails document={document} />
        </TabsContent>

        <TabsContent value="distributions">
          <Card className="p-6">
            <AddocDistributions document={document} />
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card className="p-6">
            <AddocAttachments document={document} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
