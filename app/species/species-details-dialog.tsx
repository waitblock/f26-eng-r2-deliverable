"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FormEvent, MouseEventHandler } from "react";
import { useState } from "react";
import { z } from "zod";

type Species = Database["public"]["Tables"]["species"]["Row"];
const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);

const speciesSchema = z.object({
  scientific_name: z
    .string()
    .trim()
    .min(1)
    .transform((val) => val?.trim()),
  common_name: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  kingdom: kingdoms,
  total_population: z.number().int().positive().min(1).nullable(),
  image: z
    .string()
    .url()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  description: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
});

type SpeciesInput = z.infer<typeof speciesSchema>;

export default function SpeciesDetailsDialog({ species, userId }: { species: Species; userId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const [sciName, setSciName] = useState(species.scientific_name);
  const [comName, setComName] = useState(species.common_name ?? "");
  const [kingdomName, setKingdomName] = useState(species.kingdom);
  const [totalPopulation, setTotalPopulation] = useState(species.total_population ?? "");
  const [imageUrl, setImageUrl] = useState(species.image ?? "");
  const [descriptionText, setDescriptionText] = useState(species.description ?? "");

  const startEditing: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    console.log("Editing mode activated");
    setIsEditing(true);
  };

  const resetForm = () => {
    setSciName(species.scientific_name);
    setComName(species.common_name ?? "");
    setKingdomName(species.kingdom);
    setTotalPopulation(species.total_population ?? "");
    setImageUrl(species.image ?? "");
    setDescriptionText(species.description ?? "");
  }

  const deleteSpecies: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();

    const confirm = window.confirm(
      `Are you sure you want to delete ${species.scientific_name}?`,
    );

    if(!confirm) return;

    void (async () => {
      const supabase = createBrowserSupabaseClient();

      const { error } = await supabase
        .from("species")
        .delete()
        .eq("id", species.id)
        .eq("author", userId);

      if (error) {
        toast({
          title: "Something went wrong.",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      router.refresh();

      toast({
        title: "Species deleted.",
        description: "Successfully deleted species from database.",
      });
    })();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const result = speciesSchema.safeParse({
      scientific_name: sciName,
      common_name: comName,
      kingdom: kingdomName,
      total_population: totalPopulation === ""
        ? null : Number(totalPopulation),
      image: imageUrl === ""
        ? null : imageUrl,
      description: descriptionText,
    });

    if (!result.success) {
      toast({
        title: "Something went wrong.",
        description: result.error.issues[0]?.message,
        variant: "destructive",
      });
      return;
    }

    const input: SpeciesInput = result.data;

    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase
      .from("species")
      .update({
        scientific_name: input.scientific_name,
        common_name: input.common_name,
        kingdom: input.kingdom,
        total_population: input.total_population,
        image: input.image,
        description: input.description,
      })
      .eq("id", species.id)
      .eq("author", userId);

    if (error) {
      toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setIsEditing(false);
    router.refresh();

    toast({
      title: "Species updated.",
      description: "Successfully saved your changes.",
    });
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setIsEditing(false);
      }}
    >
      <DialogTrigger asChild>
        <Button className={"mt-3 w-full"}>Learn More</Button>
      </DialogTrigger>
      <DialogContent className={"max-h-screen overflow-y-auto sm:max-w-[600px]"}>
        <DialogHeader>
          <DialogTitle>View & Edit Species Information</DialogTitle>
          <DialogDescription>
            {species.image && (
              <div className="relative h-64 w-full">
                <Image
                  src={species.image}
                  alt={species.scientific_name ?? "Species"}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
          </DialogDescription>
          <form onSubmit={(e) => void handleSubmit(e)}>
            <div className={"mb-3"}>
              <b>Scientific Name</b>
              <Input
                name="scientific_name"
                type={"text"}
                value={sciName}
                onChange={(e) => setSciName(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className={"mb-3"}>
              <b>Common Name</b>
              <Input
                name={"common_name"}
                type={"text"}
                value={comName}
                onChange={(e) => setComName(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={"mb-3"}>
              <b>Kingdom</b>
              <Select name="kingdom"
                      value={kingdomName}
                      onValueChange={(value) => setKingdomName(kingdoms.parse(value))}
                      disabled={!isEditing}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a kingdom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {kingdoms.options.map((kingdom) => (
                      <SelectItem key={kingdom} value={kingdom}>
                        {kingdom}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className={"mb-3"}>
              <b>Population</b>
              <Input
                name="total_population"
                type={"number"}
                value={totalPopulation}
                onChange={(e) => setTotalPopulation(e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className={"mb-3"}>
              <b>Image URL</b>
              <Input name="image"
                     type={"text"}
                     value={imageUrl}
                     onChange={(e) => setImageUrl(e.target.value)}
                     disabled={!isEditing} />
            </div>

            <div className={"mb-3"}>
              <b>Description</b>
              <Textarea name="description"
                        value={descriptionText}
                        onChange={(e) => setDescriptionText(e.target.value)}
                        disabled={!isEditing} />
            </div>

            {userId === species.author &&
              (!isEditing ? (
                <Button type={"button"} onClick={startEditing}>
                  Edit species data
                </Button>
              ) : (
                <Button type={"submit"}>Submit changes</Button>
              ))}

            {userId === species.author && !isEditing &&
              (<Button type={"button"}
                        variant={"destructive"}
                        className={"ml-4"}
              onClick={deleteSpecies}>Delete species data</Button>)
            }

            {isEditing && (
              <Button type={"button"}
                      variant="destructive"
                      className={"ml-4"}
                      onClick={() => {
                        resetForm();
                        setIsEditing(false);
                      }}>
                Cancel changes
              </Button>
            )}
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
