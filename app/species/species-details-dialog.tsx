import type { Database } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import Image from "next/image";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesDetailsDialog({ species } : { species: Species }) {


  return (

    <Dialog>
      <DialogTrigger asChild>
        <Button className={"mt-3 w-full"}>Learn More</Button>
      </DialogTrigger>
      <DialogContent className={"max-h-screen overflow-y-auto sm:max-w-[600px]"}>
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>
          {species.common_name && <DialogDescription>
            {species.common_name}</DialogDescription>}
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
            <b>Total population:</b> {species.total_population}
            <br/>
            <b>Kingdom</b>: {species.kingdom}
            <br/>
            <b>Description:</b> {species.description}
          </DialogDescription>
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
 */
