"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FormEvent, MouseEventHandler } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesDetailsDialog({ species }: { species: Species }) {
  const [isEditing, setIsEditing] = useState(false);

  const startEditing: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    console.log("Editing mode activated");
    setIsEditing(true);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    console.log("handleSubmit", e);
    setIsEditing(false);
  };

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) setIsEditing(false);
    }}>
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
          <form onSubmit={handleSubmit}>
            <div className={"mb-4"}>
              <b>Scientific Name</b>
              <Input type={"text"} defaultValue={species.scientific_name} disabled={!isEditing}/>
            </div>
            <div className={"mb-4"}>
              <b>Common Name</b>
              <Input type={"text"} defaultValue={species.common_name ?? ""} disabled={!isEditing} />
            </div>

            <div className={"mb-4"}>
              <b>Population</b>
              <Input type={"number"} defaultValue={species.total_population ?? ""} disabled={!isEditing}/>
            </div>

            <div className={"mb-4"}>
              <b>Image URL</b>
              <Input type={"text"} defaultValue={species.image ?? ""} disabled={!isEditing}/>
            </div>

            <div className={"mb-4"}>
              <b>Description</b>
              <Textarea defaultValue={species.description ?? ""} disabled={!isEditing} />
            </div>

            {!isEditing ?
              (<Button type={"button"} onClick={startEditing}>Edit species data</Button>)
              : (<Button type={"submit"}>Submit changes</Button>)}
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

/*
- the form should allow users to toggle to edit mode (go the slides, there's information about this)
  - make a button that says edit species
- use *zod* to check the input of edits
- can reuse the form from add-species-dialog.tsx
- remove placeholders from edits
- also add a dialog close when in the editing context to cancel
  - a nice ux feature would be to add a confirm before cancelling
  - when cancelling just reset to default values
- use createbrowsersupabase for updating the database
 */
