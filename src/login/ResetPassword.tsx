import { useState } from "react";
import { Button, Input, Typography } from "antd";

const { Text } = Typography;

export interface Reset {
  userName: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ResetPassword = () => {
  const [fields, setFields] = useState<Reset>({
    userName: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=username, 2=otp, 3=new password

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt?.target;
    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error when typing
  };

  const validateUsername = () => {
    const newErrors: Record<string, string> = {};
    if (!fields?.userName) {
      newErrors.userName = "Registered Email/Mobile Number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = () => {
    if (validateUsername()) {
      setStep(2); // go to OTP step
    }
  };

  const handleVerifyOTP = () => {
    if (!fields.otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }
    setStep(3); // go to reset password step
  };

  const handleResetPassword = () => {
    const newErrors: Record<string, string> = {};
    if (!fields.newPassword) {
      newErrors.newPassword = "New password is required";
    }
    if (fields.newPassword !== fields.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      //  call backend
    }
  };

  return (
    <div className="max-w-[400px] border border-gray-300 rounded-xl shadow-md bg-white flex flex-col gap-4 p-6 my-10 mx-auto">
      {step === 1 && (
        <>
          <div>
            <Text>
              Username<Text type="danger">*</Text>
            </Text>
            <Input
              name="userName"
              placeholder="Enter registered Email/Mobile Number"
              value={fields?.userName}
              onChange={handleChange}
            />
            {errors?.userName && (
              <div className="text-red-500 text-xs pt-1.5">
                {errors.userName}
              </div>
            )}
          </div>
          <Button type="primary" block onClick={handleSendOTP}>
            Send OTP
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <div>
            <Text>
              Enter OTP<Text type="danger">*</Text>
            </Text>
            <Input
              name="otp"
              placeholder="Enter the 6 digit number received"
              value={fields?.otp}
              onChange={handleChange}
            />
            {errors?.otp && (
              <div className="text-red-500 text-xs pt-1.5">{errors.otp}</div>
            )}
          </div>
          <Button type="primary" block onClick={handleVerifyOTP}>
            Verify OTP
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          <div>
            <Text>
              New Password<Text type="danger">*</Text>
            </Text>
            <Input.Password
              name="newPassword"
              placeholder="Enter new password"
              value={fields?.newPassword}
              onChange={handleChange}
            />
            {errors?.newPassword && (
              <div className="text-red-500 text-xs pt-1.5">
                {errors.newPassword}
              </div>
            )}
          </div>
          <div>
            <Text>
              Confirm New Password<Text type="danger">*</Text>
            </Text>
            <Input.Password
              name="confirmNewPassword"
              placeholder="Re-enter password"
              value={fields?.confirmNewPassword}
              onChange={handleChange}
            />
            {errors?.confirmNewPassword && (
              <div className="text-red-500 text-xs pt-1.5">
                {errors.confirmNewPassword}
              </div>
            )}
          </div>
          <Button type="primary" block onClick={handleResetPassword}>
            Reset Password
          </Button>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
