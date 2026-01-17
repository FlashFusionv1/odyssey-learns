import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Image, 
  Sparkles, 
  Download, 
  Trash2, 
  RefreshCw, 
  Loader2,
  CheckCircle2,
  XCircle,
  Wand2,
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  Palette
} from "lucide-react";

type ImageType = "dashboard" | "subject" | "badge" | "mascot" | "illustration" | "ui";

interface ImageDefinition {
  imageType: ImageType;
  imageCategory: string;
  title: string;
  prompt: string;
}

/** Predefined image prompts for batch generation */
const PREDEFINED_IMAGES: Record<string, ImageDefinition[]> = {
  dashboards: [
    {
      imageType: "dashboard",
      imageCategory: "k2",
      title: "K-2 Child Dashboard",
      prompt: "A magical treehouse learning environment for children ages 5-7, featuring warm colors (coral #FF6B9D, orange #FFA500, grass green #4CAF50), large friendly cartoon characters, floating books, sparkly stars, clouds, with a cozy nurturing atmosphere. Bright, cheerful, child-safe imagery with no text. Digital illustration style, rounded shapes, soft lighting.",
    },
    {
      imageType: "dashboard",
      imageCategory: "35",
      title: "3-5 Child Dashboard",
      prompt: "An explorer's adventure camp for children ages 8-10, featuring indigo (#5C6BC0) and teal (#26A69A) colors, treasure maps, magnifying glasses, compass, journals, binoculars, adventure gear. Shows curiosity and discovery. Digital illustration, semi-realistic cartoon style with vibrant colors and dynamic composition.",
    },
    {
      imageType: "dashboard",
      imageCategory: "68",
      title: "6-8 Child Dashboard",
      prompt: "A modern digital learning hub for middle schoolers ages 11-13, featuring royal blue (#1976D2) and slate gray (#455A64), holographic displays, tablets, books, scientific equipment, collaborative workspace. Clean modern design, semi-minimalist, showing intelligence and achievement.",
    },
    {
      imageType: "dashboard",
      imageCategory: "912",
      title: "9-12 Child Dashboard",
      prompt: "A sophisticated academic workspace for high schoolers ages 14-18, featuring deep blue (#0D47A1) and slate (#37474F), laptop, notebooks, graduation cap, world map, achievement certificates. Professional, college-preparatory atmosphere. Clean, modern, aspirational design.",
    },
    {
      imageType: "dashboard",
      imageCategory: "parent",
      title: "Parent Dashboard",
      prompt: "A warm family learning environment showing parent and child connection, featuring soft gradients, analytics charts, progress paths, achievement displays. Warm coral and teal accents on clean white background. Shows care, oversight, and celebration of learning. Professional yet approachable.",
    },
    {
      imageType: "dashboard",
      imageCategory: "teacher",
      title: "Teacher Portal",
      prompt: "A professional classroom management interface showing student progress, assignments, and analytics. Clean design with blue and green accents, showing multiple student avatars, charts, and learning pathways. Professional educator-focused imagery.",
    },
    {
      imageType: "dashboard",
      imageCategory: "play",
      title: "Play Zone",
      prompt: "A colorful playground of learning games for children, featuring bright rainbow colors, game controllers, puzzle pieces, bouncing stars, happy characters playing educational games. Fun, energetic, playful atmosphere with confetti and celebration elements.",
    },
    {
      imageType: "dashboard",
      imageCategory: "rewards",
      title: "Rewards Hub",
      prompt: "A treasure vault of achievements and rewards, featuring golden coins, sparkling gems, trophy collection, badge display case, stars, ribbons. Exciting, motivating atmosphere with warm gold and purple colors. Celebratory and aspirational.",
    },
    {
      imageType: "dashboard",
      imageCategory: "social",
      title: "Social Dashboard",
      prompt: "A friendly gathering space for peer learning, featuring diverse children avatars connecting, sharing ideas, collaborative projects, chat bubbles, friendship symbols. Warm, inclusive atmosphere with soft pastel colors.",
    },
    {
      imageType: "dashboard",
      imageCategory: "calm",
      title: "Calm Zone",
      prompt: "A serene meditation and relaxation space for children, featuring soft clouds, gentle waves, breathing circle, peaceful nature elements, calming colors (soft blue, lavender, mint). Tranquil, safe, soothing atmosphere for emotional regulation.",
    },
  ],
  subjects: [
    {
      imageType: "subject",
      imageCategory: "reading",
      title: "Reading Subject Icon",
      prompt: "A magical open book with pages floating upward, letters dancing in the air, soft golden light emanating from pages. Simple icon style, vibrant colors, suitable for educational app. No text, just imagery.",
    },
    {
      imageType: "subject",
      imageCategory: "math",
      title: "Math Subject Icon",
      prompt: "Colorful mathematical symbols (plus, minus, multiply, divide) floating around a glowing calculator or number blocks. Playful geometry shapes. Simple icon style, bright colors, educational app suitable.",
    },
    {
      imageType: "subject",
      imageCategory: "science",
      title: "Science Subject Icon",
      prompt: "A bubbling science beaker with colorful liquids, atoms orbiting, a planet, DNA helix in background. Discovery and experimentation theme. Simple icon style, vibrant colors.",
    },
    {
      imageType: "subject",
      imageCategory: "social-studies",
      title: "Social Studies Icon",
      prompt: "A globe with diverse children holding hands around it, cultural landmarks, maps, community symbols. Unity and global learning theme. Simple icon style, warm inclusive colors.",
    },
    {
      imageType: "subject",
      imageCategory: "life-skills",
      title: "Life Skills Icon",
      prompt: "Practical life elements: clock for time management, piggy bank for money, cooking utensils, first aid kit, organized desk. Independence and practical learning. Simple icon style.",
    },
    {
      imageType: "subject",
      imageCategory: "emotional-intelligence",
      title: "Emotional Intelligence Icon",
      prompt: "A glowing heart with emotion faces (happy, calm, thoughtful) around it, gentle rainbow colors, empathy symbols. Emotional awareness and understanding. Simple icon style, soft warm colors.",
    },
  ],
  badges: [
    {
      imageType: "badge",
      imageCategory: "reading",
      title: "Reading Champion Badge",
      prompt: "A golden badge with an open book and stars, laurel wreath border, 'champion' feel without text. Prestigious achievement design, metallic gold and royal blue. Badge/medal style.",
    },
    {
      imageType: "badge",
      imageCategory: "math",
      title: "Math Wizard Badge",
      prompt: "A magical badge with wizard hat, mathematical symbols, sparkles, starry background. Achievement medal style in purple and gold. Prestigious and magical feel.",
    },
    {
      imageType: "badge",
      imageCategory: "science",
      title: "Science Explorer Badge",
      prompt: "An explorer badge with magnifying glass, beaker, rocket ship, stars. Adventure and discovery theme. Green and gold colors, medal style design.",
    },
    {
      imageType: "badge",
      imageCategory: "kindness",
      title: "Kindness Hero Badge",
      prompt: "A heart-shaped badge with helping hands, rainbow, stars, warm glow. Compassion and empathy theme. Pink and gold colors, medal style with soft edges.",
    },
  ],
  mascots: [
    {
      imageType: "mascot",
      imageCategory: "main",
      title: "Odyssey Owl - Main Mascot",
      prompt: "A wise, friendly cartoon owl wearing a graduation cap, holding a book, with big expressive eyes and warm smile. Soft teal and cream colors, welcoming pose. Children's educational app mascot style, full body character.",
    },
    {
      imageType: "mascot",
      imageCategory: "celebration",
      title: "Sparky Star - Celebration Mascot",
      prompt: "An excited, energetic cartoon star character with sparkly trails, party hat, confetti, celebrating expression. Golden yellow with rainbow sparkles. Celebration and achievement mascot, bouncy energetic pose.",
    },
    {
      imageType: "mascot",
      imageCategory: "comfort",
      title: "Buddy Bear - Comfort Mascot",
      prompt: "A gentle, huggable cartoon bear with soft fur, calm smile, holding a heart pillow. Soft brown and cream colors, peaceful expression. Comfort and emotional support mascot, cozy and reassuring.",
    },
  ],
  illustrations: [
    {
      imageType: "illustration",
      imageCategory: "quiz",
      title: "Quiz Game Illustration",
      prompt: "Children excitedly answering quiz questions, thought bubbles with ideas, question marks, lightbulbs for correct answers. Dynamic, fun learning atmosphere. Cartoon style, bright colors.",
    },
    {
      imageType: "illustration",
      imageCategory: "story",
      title: "Story Adventure Illustration",
      prompt: "A child reading inside a magical book portal, story characters coming to life around them, fantasy landscape. Imagination and wonder theme. Whimsical illustration style.",
    },
    {
      imageType: "illustration",
      imageCategory: "coloring",
      title: "Coloring Activity Illustration",
      prompt: "Art supplies arranged creatively - crayons, paintbrushes, color palette, paper with emerging colorful artwork. Creative expression theme. Bright, artistic style.",
    },
    {
      imageType: "illustration",
      imageCategory: "roleplay",
      title: "Role Playing Illustration",
      prompt: "Children dressed as different professions - doctor, astronaut, teacher, chef - in a playful learning scenario. Career exploration and imagination. Cartoon style, diverse characters.",
    },
    {
      imageType: "illustration",
      imageCategory: "self-soothing",
      title: "Self-Soothing Illustration",
      prompt: "A child in peaceful meditation pose surrounded by calming elements - soft clouds, gentle bubbles, breathing circle, nature. Relaxation and mindfulness theme. Soft, soothing colors.",
    },
  ],
  ui: [
    {
      imageType: "ui",
      imageCategory: "empty-state",
      title: "Empty State Illustration",
      prompt: "A friendly illustration for empty content areas - cute character looking curious with speech bubble suggesting to 'start exploring'. Encouraging and inviting. Soft colors, minimal design.",
    },
    {
      imageType: "ui",
      imageCategory: "loading",
      title: "Loading State Illustration",
      prompt: "A cheerful animation-ready illustration of Odyssey Owl flying through clouds carrying books, trailing sparkles. Motion and progress theme. Simple, loop-friendly design.",
    },
  ],
};

interface GeneratedImage {
  id: string;
  image_type: string;
  image_category: string | null;
  title: string;
  prompt: string;
  storage_path: string | null;
  storage_url: string | null;
  is_active: boolean;
  created_at: string;
}

/**
 * ImageGenerationStudio - Admin component for AI image generation
 * Allows batch generation, preview, and management of platform images
 */
export function ImageGenerationStudio() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("gallery");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customType, setCustomType] = useState<string>("illustration");
  const [customCategory, setCustomCategory] = useState("");

  // Fetch existing generated images
  const { data: images, isLoading } = useQuery({
    queryKey: ["generated-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GeneratedImage[];
    },
  });

  // Generate single image mutation
  const generateImageMutation = useMutation({
    mutationFn: async (imageReq: ImageDefinition) => {
      const { data, error } = await supabase.functions.invoke("generate-platform-images", {
        body: imageReq,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-images"] });
    },
  });

  // Batch generate images
  const handleBatchGenerate = useCallback(async (category: string) => {
    const imagesToGenerate = PREDEFINED_IMAGES[category];
    if (!imagesToGenerate) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus([]);

    for (let i = 0; i < imagesToGenerate.length; i++) {
      const img = imagesToGenerate[i];
      setGenerationStatus((prev) => [...prev, `Generating: ${img.title}...`]);

      try {
        await generateImageMutation.mutateAsync(img);
        setGenerationStatus((prev) => [...prev, `✓ ${img.title} complete`]);
      } catch (error) {
        setGenerationStatus((prev) => [...prev, `✗ ${img.title} failed: ${error}`]);
      }

      setGenerationProgress(((i + 1) / imagesToGenerate.length) * 100);
    }

    setIsGenerating(false);
    toast.success(`Generated ${imagesToGenerate.length} ${category} images`);
    queryClient.invalidateQueries({ queryKey: ["generated-images"] });
  }, [generateImageMutation, queryClient]);

  // Generate all images
  const handleGenerateAll = useCallback(async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus([]);

    const allImages = [
      ...PREDEFINED_IMAGES.dashboards,
      ...PREDEFINED_IMAGES.subjects,
      ...PREDEFINED_IMAGES.badges,
      ...PREDEFINED_IMAGES.mascots,
      ...PREDEFINED_IMAGES.illustrations,
      ...PREDEFINED_IMAGES.ui,
    ];

    for (let i = 0; i < allImages.length; i++) {
      const img = allImages[i];
      setGenerationStatus((prev) => [...prev, `Generating: ${img.title}...`]);

      try {
        await generateImageMutation.mutateAsync(img);
        setGenerationStatus((prev) => [...prev, `✓ ${img.title} complete`]);
      } catch (error) {
        setGenerationStatus((prev) => [...prev, `✗ ${img.title} failed`]);
      }

      setGenerationProgress(((i + 1) / allImages.length) * 100);
    }

    setIsGenerating(false);
    toast.success("Generated all platform images!");
  }, [generateImageMutation]);

  // Generate custom image
  const handleCustomGenerate = useCallback(async () => {
    if (!customPrompt || !customTitle) {
      toast.error("Please provide a title and prompt");
      return;
    }

    setIsGenerating(true);
    try {
      await generateImageMutation.mutateAsync({
        imageType: customType as ImageType,
        imageCategory: customCategory || "custom",
        title: customTitle,
        prompt: customPrompt,
      });
      toast.success(`Generated: ${customTitle}`);
      setCustomPrompt("");
      setCustomTitle("");
    } catch (error) {
      toast.error(`Failed to generate: ${error}`);
    }
    setIsGenerating(false);
  }, [customPrompt, customTitle, customType, customCategory, generateImageMutation]);

  // Delete image
  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("generated_images")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete image");
    } else {
      toast.success("Image deleted");
      queryClient.invalidateQueries({ queryKey: ["generated-images"] });
    }
  }, [queryClient]);

  // Group images by type
  const groupedImages = images?.reduce((acc, img) => {
    const type = img.image_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(img);
    return acc;
  }, {} as Record<string, GeneratedImage[]>) || {};

  const typeIcons: Record<string, React.ReactNode> = {
    dashboard: <LayoutDashboard className="h-4 w-4" />,
    subject: <BookOpen className="h-4 w-4" />,
    badge: <Award className="h-4 w-4" />,
    mascot: <Users className="h-4 w-4" />,
    illustration: <Palette className="h-4 w-4" />,
    ui: <Image className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Image Generation Studio
          </CardTitle>
          <CardDescription>
            Generate and manage platform images using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="batch">Batch Generate</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : images?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No images generated yet</p>
                  <p className="text-sm">Use the Batch Generate tab to create platform images</p>
                </div>
              ) : (
                Object.entries(groupedImages).map(([type, imgs]) => (
                  <div key={type} className="space-y-3">
                    <h3 className="flex items-center gap-2 font-semibold capitalize">
                      {typeIcons[type]}
                      {type} ({imgs.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imgs.map((img) => (
                        <Card key={img.id} className="overflow-hidden">
                          <div className="aspect-square bg-muted relative">
                            {img.storage_url ? (
                              <img
                                src={img.storage_url}
                                alt={img.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Image className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <Badge 
                              variant="secondary" 
                              className="absolute top-2 left-2 text-xs"
                            >
                              {img.image_category || "general"}
                            </Badge>
                          </div>
                          <CardContent className="p-3">
                            <p className="text-sm font-medium truncate">{img.title}</p>
                            <div className="flex gap-1 mt-2">
                              {img.storage_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => window.open(img.storage_url!, "_blank")}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setCustomPrompt(img.prompt);
                                  setCustomTitle(`${img.title} (v2)`);
                                  setCustomType(img.image_type);
                                  setCustomCategory(img.image_category || "");
                                  setActiveTab("custom");
                                }}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(img.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Batch Generate Tab */}
            <TabsContent value="batch" className="space-y-4">
              {isGenerating ? (
                <div className="space-y-4">
                  <Progress value={generationProgress} />
                  <p className="text-center text-sm text-muted-foreground">
                    Generating images... {Math.round(generationProgress)}%
                  </p>
                  <ScrollArea className="h-48 border rounded-md p-3">
                    {generationStatus.map((status, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm py-1">
                        {status.startsWith("✓") ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : status.startsWith("✗") ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {status.replace(/^[✓✗]\s*/, "")}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Button
                      onClick={() => handleBatchGenerate("dashboards")}
                      disabled={isGenerating}
                      className="h-auto py-4 flex-col"
                    >
                      <LayoutDashboard className="h-6 w-6 mb-2" />
                      <span>Dashboards</span>
                      <span className="text-xs opacity-70">10 images</span>
                    </Button>
                    <Button
                      onClick={() => handleBatchGenerate("subjects")}
                      disabled={isGenerating}
                      variant="secondary"
                      className="h-auto py-4 flex-col"
                    >
                      <BookOpen className="h-6 w-6 mb-2" />
                      <span>Subjects</span>
                      <span className="text-xs opacity-70">6 images</span>
                    </Button>
                    <Button
                      onClick={() => handleBatchGenerate("badges")}
                      disabled={isGenerating}
                      variant="secondary"
                      className="h-auto py-4 flex-col"
                    >
                      <Award className="h-6 w-6 mb-2" />
                      <span>Badges</span>
                      <span className="text-xs opacity-70">4 images</span>
                    </Button>
                    <Button
                      onClick={() => handleBatchGenerate("mascots")}
                      disabled={isGenerating}
                      variant="secondary"
                      className="h-auto py-4 flex-col"
                    >
                      <Users className="h-6 w-6 mb-2" />
                      <span>Mascots</span>
                      <span className="text-xs opacity-70">3 images</span>
                    </Button>
                    <Button
                      onClick={() => handleBatchGenerate("illustrations")}
                      disabled={isGenerating}
                      variant="secondary"
                      className="h-auto py-4 flex-col"
                    >
                      <Palette className="h-6 w-6 mb-2" />
                      <span>Illustrations</span>
                      <span className="text-xs opacity-70">5 images</span>
                    </Button>
                    <Button
                      onClick={() => handleBatchGenerate("ui")}
                      disabled={isGenerating}
                      variant="secondary"
                      className="h-auto py-4 flex-col"
                    >
                      <Image className="h-6 w-6 mb-2" />
                      <span>UI Elements</span>
                      <span className="text-xs opacity-70">2 images</span>
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleGenerateAll}
                      disabled={isGenerating}
                      size="lg"
                      className="w-full"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate All 30 Images
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Custom Tab */}
            <TabsContent value="custom" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Image Type</label>
                    <Select value={customType} onValueChange={setCustomType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="subject">Subject Icon</SelectItem>
                        <SelectItem value="badge">Badge</SelectItem>
                        <SelectItem value="mascot">Mascot</SelectItem>
                        <SelectItem value="illustration">Illustration</SelectItem>
                        <SelectItem value="ui">UI Element</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category (optional)</label>
                    <Input
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g., k2, reading, main"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="My Custom Image"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleCustomGenerate}
                  disabled={isGenerating || !customPrompt || !customTitle}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default ImageGenerationStudio;
