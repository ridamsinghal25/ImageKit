"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import FileUpload from "./FileUpload";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useNotification } from "./Notification";
import { IMAGE_VARIANTS, ImageVariantType } from "@/models/Product";
import { apiClient, ProductFormData } from "@/lib/api-client";

export default function AdminProductForm() {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      variants: [
        {
          type: "SQUARE" as ImageVariantType,
          price: 9.99,
          license: "personal",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const handleUploadSuccess = (response: IKUploadResponse) => {
    setValue("imageUrl", response.filePath);
    showNotification("Image uploaded successfully!", "success");
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      await apiClient.createProduct(data);
      showNotification("Product created successfully!", "success");

      // Reset form after successful submission
      setValue("name", "");
      setValue("description", "");
      setValue("imageUrl", "");
      setValue("variants", [
        {
          type: "SQUARE" as ImageVariantType,
          price: 9.99,
          license: "personal",
        },
      ]);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to create product",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 max-w-2xl mx-auto p-4"
    >
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-200"
        >
          Product Name
        </label>
        <input
          type="text"
          id="name"
          {...register("name", { required: "Name is required" })}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-200"
        >
          Description
        </label>
        <textarea
          id="description"
          {...register("description", {
            required: "Description is required",
          })}
          className={`w-full px-3 py-2 border rounded-md h-24 text-black ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Product Image
        </label>
        <FileUpload onSuccess={handleUploadSuccess} />
      </div>

      <hr className="my-8" />

      <h2 className="text-lg font-semibold mb-4">Image Variants</h2>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="bg-gray-50 p-4 rounded-md mb-4 animate-fade-in"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label
                htmlFor={`variants.${index}.type`}
                className="block text-sm font-medium text-black"
              >
                Size & Aspect Ratio
              </label>

              <select
                id={`variants.${index}.type`}
                {...register(`variants.${index}.type`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              >
                {Object.entries(IMAGE_VARIANTS).map(([key, value]) => (
                  <option key={key} value={value.type}>
                    {value.label} ({value.dimensions.width}x
                    {value.dimensions.height})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`variants.${index}.license`}
                className="block text-sm font-medium text-black"
              >
                License
              </label>
              <select
                id={`variants.${index}.license`}
                {...register(`variants.${index}.license`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              >
                <option value="personal">Personal Use</option>
                <option value="commercial">Commercial Use</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`variants.${index}.price`}
                className="block text-sm font-medium text-black"
              >
                Price ($)
              </label>
              <input
                type="number"
                id={`variants.${index}.price`}
                step="0.01"
                min="0.01"
                {...register(`variants.${index}.price`, {
                  valueAsNumber: true,
                  required: "Price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" },
                })}
                className={`w-full px-3 py-2 border rounded-md text-black ${
                  errors.variants?.[index]?.price
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.variants?.[index]?.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.variants[index]?.price?.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          >
            <Trash2 className="w-4 h-4 inline-block mr-2" />
            Remove Variant
          </button>
        </div>
      ))}

      <button
        type="button"
        className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        onClick={() =>
          append({
            type: "SQUARE",
            price: 9.99,
            license: "personal",
          })
        }
      >
        <Plus className="w-4 h-4 inline-block mr-2" />
        Add Variant
      </button>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
            Creating Product...
          </>
        ) : (
          "Create Product"
        )}
      </button>
    </form>
  );
}
