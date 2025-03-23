import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

type UserRole = "CUSTOMER" | "RETAILER" | "LOGISTIC";

interface RegisterFormValues {
  name: string;
  role: UserRole;
}

interface RegisterModalProps {
  open: boolean;
  onRegister: (values: RegisterFormValues) => Promise<void>;
}

const registerSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  role: yup
    .string()
    .oneOf(["CUSTOMER", "RETAILER", "LOGISTIC"] as const)
    .required("Role is required"),
});

const RegisterModal = ({ open, onRegister }: RegisterModalProps) => {
  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      name: "",
      role: "CUSTOMER",
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      await onRegister(values);
    },
  });

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <style jsx global>{`
          .dialog-close-button {
            display: none !important;
          }
        `}</style>
        <DialogHeader>
          <DialogTitle>Complete Registration</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-500">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              name="role"
              value={formik.values.role}
              onValueChange={(value) => formik.setFieldValue("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="RETAILER">Retailer</SelectItem>
                <SelectItem value="LOGISTIC">Logistics</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.role && formik.errors.role && (
              <p className="text-sm text-red-500">{formik.errors.role}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid}
            >
              Register
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
